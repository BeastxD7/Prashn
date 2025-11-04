import { Request, Response } from "express";
import crypto from "crypto"
import { razorpay } from "../utils/razorpay";
import { CREDIT_PACKAGES } from "../constants/credits";
import dotenv from "dotenv";
import prisma from "../db/prisma";
dotenv.config();

export const createOrder = async (req: Request, res: Response) => {
    try {
        const plan = req.body.plan;

        const selectedPackage = CREDIT_PACKAGES.find(p => p.id === plan);

        if (!selectedPackage) {
            return res.status(400).json({ message: "Invalid package selected" });
        }

        const options = {
            amount: selectedPackage.price * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: crypto.randomBytes(10).toString('hex'),
            notes: { plan: selectedPackage.id }
        };

        const order = await razorpay.orders.create(options, (err, order) => {
            if (err) {
                res.json({ message: "Something went wrong" });
            } else {
                res.status(200).json({ status: true, message: "Order created successfully", order });
            }
        });
    } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });

}
}


export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ status: false, message: "Unauthorized" });

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
    const expectedSig = crypto.createHmac("sha256", secret).update(`${order_id}|${payment_id}`).digest("hex");
    if (expectedSig !== signature) {
      return res.status(400).json({ status: false, message: "Invalid signature" });
    }

    // 2) idempotency check: has this paymentId been processed before?
    const existing = await prisma.payment.findUnique({ where: { paymentId: payment_id } });
    if (existing) {
      return res.status(200).json({ status: true, message: "Payment already processed" });
    }

    // 3) fetch order + payment from Razorpay for double-check
    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(order_id),
      razorpay.payments.fetch(payment_id),
    ]);

    console.log("Fetched Order: " ,order);
    console.log("Fetched Payment: " ,payment);

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
    const planId = order?.notes?.plan;
    const pkg = CREDIT_PACKAGES.find(p => typeof p === "object" && (p as any).id === planId) as { id: string; name?: string; credits: number; price: number } | undefined;
    if (!pkg) {
      return res.status(400).json({ status: false, message: "Unknown plan in order" });
    }

    const expectedPaise = pkg.price * 100;
    if (order.amount !== expectedPaise) {
      return res.status(400).json({ status: false, message: "Order amount mismatch" });
    }

    // 6) atomically update user credits and create payment record
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: pkg.credits } },
      }),
      prisma.payment.create({
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
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getPlanDetails = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ status: true, plans: CREDIT_PACKAGES });
    } catch (error) {
        console.error("getPlanDetails error:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};