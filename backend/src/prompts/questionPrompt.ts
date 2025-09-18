import { AgentContext } from '../ai_agent/types';

export function getQuestionPrompt(context: AgentContext): string {
  return `Based on the ongoing story: "${context.storySoFar}", ask the user a fun and thoughtful question to involve them, without telling the answer.`;
}
