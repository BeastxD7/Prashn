import { Request, Response } from "express";
import { runConversation } from "../ai_agent/orchestrator";
import { AgentContext } from "../ai_agent/types";

export const converse = async (req: Request, res: Response) => {
  try {
    const context: AgentContext = req.body;
    const agentResult = await runConversation(context);
    res.json(agentResult);
  } catch (err) {
    console.error("Agent error:", err);
    res.status(500).json({ error: "Agent processing failed." });
  }
};
