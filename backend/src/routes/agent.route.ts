import { Router } from "express";
import { converse } from "../controllers/agent.controller";



const AgentRouter = Router();

AgentRouter.post("/converse", converse);


export default AgentRouter;
