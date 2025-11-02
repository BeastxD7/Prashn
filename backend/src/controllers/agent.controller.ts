import { Request, Response } from "express";
import { callLLM } from "../ai_agent/model";

export const converse = async (req: Request, res: Response) => {
  try {
    const {text} = req.body;
    if(text) {
      const response = await callLLM(text);
      res.status(200).json({ response  });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
    
  }
}