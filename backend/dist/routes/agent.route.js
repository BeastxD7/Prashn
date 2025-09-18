"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agent_controller_1 = require("../controllers/agent.controller");
const AgentRouter = (0, express_1.Router)();
// Main AI agent conversation endpoint
AgentRouter.post("/converse", agent_controller_1.converse);
exports.default = AgentRouter;
