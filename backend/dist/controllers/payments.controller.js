"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentDetails = exports.getPaymentHistory = exports.getPlanDetails = exports.verifyPayment = exports.createOrder = void 0;
const crypto_1 = __importDefault(require("crypto"));
const razorpay_1 = require("../utils/razorpay");
const credits_1 = require("../constants/credits");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("../db/prisma"));
dotenv_1.default.config();
const createOrder = async (req, res) => {
    try {
        const offerIds = process.env.RAZORPAY_OFFER_IDS
            ? process.env.RAZORPAY_OFFER_IDS.split(",").map(id => id.trim())
            : [];
        const plan = req.body.plan;
        const selectedPackage = credits_1.CREDIT_PACKAGES.find(p => p.id === plan);
        if (!selectedPackage) {
            return res.status(400).json({ message: "Invalid package selected" });
        }
        const options = {
            amount: selectedPackage.price * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: crypto_1.default.randomBytes(10).toString('hex'),
            notes: { plan: selectedPackage.id },
            offers: offerIds.length > 0 ? offerIds : undefined,
        };
        const order = await razorpay_1.razorpay.orders.create(options, (err, order) => {
            if (err) {
                res.json({ message: "Something went wrong" });
            }
            else {
                res.status(200).json({ status: true, message: "Order created successfully", order });
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createOrder = createOrder;
const verifyPayment = async (req, res) => {
    var _a;
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ status: false, message: "Unauthorized" });
        const { order_id, payment_id, signature } = req.body;
        if (!order_id || !payment_id || !signature) {
            return res.status(400).json({ status: false, message: "Missing payment data" });
        }
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error("Missing RAZORPAY_KEY_SECRET");
            return res.status(500).json({ status: false, message: "Server misconfigured" });
        }
        // 1) verify client-sent signature first (fast fail)
        const expectedSig = crypto_1.default.createHmac("sha256", secret).update(`${order_id}|${payment_id}`).digest("hex");
        if (expectedSig !== signature) {
            return res.status(400).json({ status: false, message: "Invalid signature" });
        }
        // 2) idempotency check: has this paymentId been processed before?
        const existing = await prisma_1.default.payment.findUnique({ where: { paymentId: payment_id } });
        if (existing) {
            return res.status(200).json({ status: true, message: "Payment already processed" });
        }
        // 3) fetch order + payment from Razorpay for double-check
        const [order, payment] = await Promise.all([
            razorpay_1.razorpay.orders.fetch(order_id),
            razorpay_1.razorpay.payments.fetch(payment_id),
        ]);
        console.log("Fetched Order: ", order);
        console.log("Fetched Payment: ", payment);
        if (!order || !payment) {
            return res.status(400).json({ status: false, message: "Invalid order or payment id" });
        }
        // 4) ensure linkage and finality
        if (payment.status !== "captured") {
            return res.status(400).json({ status: false, message: "Payment is not captured" });
        }
        if (payment.order_id !== order.id) {
            return res.status(400).json({ status: false, message: "Payment does not belong to order" });
        }
        // 5) determine plan & verify amount
        const planId = (_a = order === null || order === void 0 ? void 0 : order.notes) === null || _a === void 0 ? void 0 : _a.plan;
        const pkg = credits_1.CREDIT_PACKAGES.find(p => typeof p === "object" && p.id === planId);
        if (!pkg) {
            return res.status(400).json({ status: false, message: "Unknown plan in order" });
        }
        const expectedPaise = pkg.price * 100;
        if (order.amount !== expectedPaise) {
            return res.status(400).json({ status: false, message: "Order amount mismatch" });
        }
        // 6) atomically update user credits and create payment record
        await prisma_1.default.$transaction([
            prisma_1.default.user.update({
                where: { id: userId },
                data: { credits: { increment: pkg.credits } },
            }),
            prisma_1.default.payment.create({
                data: {
                    userId,
                    orderId: order_id,
                    paymentId: payment_id,
                    receipt: order.receipt,
                    amount: Number(payment.amount) / 100,
                    currency: payment.currency,
                    plan: String(planId),
                    status: "SUCCESS",
                    metadata: JSON.parse(JSON.stringify({
                        razorpay_payment: payment,
                        razorpay_order: order,
                    })),
                },
            }),
        ]);
        return res.status(200).json({ status: true, message: "Payment verified and credits added" });
    }
    catch (err) {
        console.error("verifyPayment error:", err);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};
exports.verifyPayment = verifyPayment;
const getPlanDetails = async (req, res) => {
    try {
        res.status(200).json({ status: true, plans: credits_1.CREDIT_PACKAGES });
    }
    catch (error) {
        console.error("getPlanDetails error:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};
exports.getPlanDetails = getPlanDetails;
const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }
        const payments = await prisma_1.default.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                orderId: true,
                paymentId: true,
                receipt: true,
                amount: true,
                currency: true,
                plan: true,
                status: true,
                createdAt: true,
            }
        });
        // Enrich payment data with plan details
        const enrichedPayments = payments.map(payment => {
            const planDetails = credits_1.CREDIT_PACKAGES.find(p => p.id === payment.plan);
            return Object.assign(Object.assign({}, payment), { planName: (planDetails === null || planDetails === void 0 ? void 0 : planDetails.name) || 'Unknown Plan', creditsReceived: (planDetails === null || planDetails === void 0 ? void 0 : planDetails.credits) || 0 });
        });
        return res.status(200).json({
            status: true,
            payments: enrichedPayments,
            total: payments.length
        });
    }
    catch (error) {
        console.error("getPaymentHistory error:", error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};
exports.getPaymentHistory = getPaymentHistory;
const getPaymentDetails = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }
        const { paymentId } = req.params;
        if (!paymentId) {
            return res.status(400).json({ status: false, message: "Payment ID is required" });
        }
        const payment = await prisma_1.default.payment.findUnique({
            where: { paymentId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                }
            }
        });
        if (!payment) {
            return res.status(404).json({ status: false, message: "Payment not found" });
        }
        // Verify that the payment belongs to the requesting user
        if (payment.userId !== userId) {
            return res.status(403).json({ status: false, message: "Access denied" });
        }
        // Get plan details
        const planDetails = credits_1.CREDIT_PACKAGES.find(p => p.id === payment.plan);
        const detailedPayment = {
            id: payment.id,
            orderId: payment.orderId,
            paymentId: payment.paymentId,
            receipt: payment.receipt,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            createdAt: payment.createdAt,
            plan: {
                id: payment.plan,
                name: (planDetails === null || planDetails === void 0 ? void 0 : planDetails.name) || 'Unknown Plan',
                credits: (planDetails === null || planDetails === void 0 ? void 0 : planDetails.credits) || 0,
                price: (planDetails === null || planDetails === void 0 ? void 0 : planDetails.price) || 0,
            },
            user: payment.user,
            metadata: payment.metadata,
        };
        return res.status(200).json({
            status: true,
            payment: detailedPayment
        });
    }
    catch (error) {
        console.error("getPaymentDetails error:", error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};
exports.getPaymentDetails = getPaymentDetails;
