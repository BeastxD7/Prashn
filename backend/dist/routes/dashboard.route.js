"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const user_middleware_1 = require("../middleware/user.middleware");
const DashboardRouter = (0, express_1.Router)();
DashboardRouter.get("/", user_middleware_1.cookieAuth, dashboard_controller_1.getDashboardData);
exports.default = DashboardRouter;
