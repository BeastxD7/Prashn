import { AgentContext, AgentOutput } from './types';
import { handleStory } from './agents/storytellingAgent';
import { handleQuestion } from './agents/questionAgent';
import { handleConnector } from './agents/connectorAgent';

export async function runConversation(context: AgentContext): Promise<AgentOutput> {
  const { phase, rounds } = context.sessionState;

  if (phase === 'start') {
    return await handleStory(context);
  } else if (phase === 'question') {
    // After 2 rounds, connect the story
    if ((rounds ?? 0) >= 2) {
      return await handleConnector(context);
    }
    return await handleQuestion(context);
  } else if (phase === 'synthesis') {
    return await handleConnector(context);
  } else {
    // Default/fallback to story
    return await handleStory(context);
  }
}
