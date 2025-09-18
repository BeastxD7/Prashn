import { AgentContext, AgentOutput } from '../types';
import { getStoryPrompt } from '../../prompts/storytellingPrompt';
import { callLLM } from '../../aiModels/llm';

export async function handleStory(context: AgentContext): Promise<AgentOutput> {
  const prompt = getStoryPrompt(context);
  const story = await callLLM(prompt); // Integrate your LLM call

  return {
    outputType: 'story',
    text: story,
    sessionUpdate: { phase: 'question' }
  };
}
