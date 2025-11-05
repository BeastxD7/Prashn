import { Router } from "express";
import { cookieAuth } from "../middleware/user.middleware";
import { createOrder, getPlanDetails, verifyPayment, getPaymentHistory, getPaymentDetails } from "../controllers/payments.controller";



const PaymentRouter = Router();


PaymentRouter.post("/create-order", cookieAuth, createOrder);
PaymentRouter.post("/verify-payment", cookieAuth, verifyPayment);
PaymentRouter.get("/plan-details", cookieAuth, getPlanDetails);
PaymentRouter.get("/history", cookieAuth, getPaymentHistory);
PaymentRouter.get("/details/:paymentId", cookieAuth, getPaymentDetails);

export default PaymentRouter;
