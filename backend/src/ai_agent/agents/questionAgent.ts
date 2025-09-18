import { AgentContext, AgentOutput } from '../types';
import { getQuestionPrompt } from '../../prompts/questionPrompt';
import { callLLM } from '../../aiModels/llm';
export async function handleQuestion(context: AgentContext): Promise<AgentOutput> {
  const prompt = getQuestionPrompt(context);
  const question = await callLLM(prompt); // Integrate your LLM call

  return {
    outputType: 'question',
    text: question,
    sessionUpdate: { rounds: (context.sessionState.rounds ?? 0) + 1 }
  };
}
