import { AgentContext } from '../ai_agent/types';

export function getStoryPrompt(context: AgentContext): string {
  return `Write a short, metaphorical story that sets up an engaging scenario related to: "${context.userQuery}". Be creative and hint at the concept, but don't explain it outright.`;
}
