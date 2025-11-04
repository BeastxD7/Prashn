import { Router } from "express";
import { cookieAuth } from "../middleware/user.middleware";
import { createOrder, getPlanDetails, verifyPayment } from "../controllers/payments.controller";



const PaymentRouter = Router();


PaymentRouter.post("/create-order", cookieAuth, createOrder);
PaymentRouter.post("/verify-payment", cookieAuth, verifyPayment);
PaymentRouter.get("/plan-details", cookieAuth, getPlanDetails);

export default PaymentRouter;
