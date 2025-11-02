import { Router } from "express";
import { getDashboardData } from "../controllers/dashboard.controller";
import { cookieAuth } from "../middleware/user.middleware";



const DashboardRouter = Router();

DashboardRouter.get("/", cookieAuth, getDashboardData);


export default DashboardRouter;
