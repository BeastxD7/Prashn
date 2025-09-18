import { AgentContext } from '../ai_agent/types';

export function getConnectorPrompt(context: AgentContext): string {
  return `Given the story and the user's answers: "${context.storySoFar}", "${context.previousAnswers}", gently explain how this story leads to the real concept: "${context.userQuery}", making the connection clear and memorable.`;
}
