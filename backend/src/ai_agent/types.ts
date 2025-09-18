export interface AgentContext {
  userQuery: string;
  storySoFar: string;
  previousAnswers: string[];
  sessionState: {
    phase: 'start' | 'story' | 'question' | 'synthesis';
    rounds: number;
    [key: string]: any;
  };
}

export interface AgentOutput {
  outputType: 'story' | 'question' | 'synthesis';
  text: string;
  sessionUpdate?: Partial<AgentContext['sessionState']>;
}
