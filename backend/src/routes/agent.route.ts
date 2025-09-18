import { Router } from "express";
import { converse } from "../controllers/agent.controller";

const AgentRouter = Router();

// Main AI agent conversation endpoint
AgentRouter.post("/converse", converse);

export default AgentRouter;
