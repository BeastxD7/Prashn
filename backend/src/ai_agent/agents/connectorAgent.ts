import { AgentContext, AgentOutput } from '../types';
import { getConnectorPrompt } from '../../prompts/connectorPrompt';
import { callLLM } from '../../aiModels/llm';

export async function handleConnector(context: AgentContext): Promise<AgentOutput> {
  const prompt = getConnectorPrompt(context);
  const connection = await callLLM(prompt); // Integrate your LLM call

  return {
    outputType: 'synthesis',
    text: connection,
    sessionUpdate: { phase: 'synthesis' }
  };
}
