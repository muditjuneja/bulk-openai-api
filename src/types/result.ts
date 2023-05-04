export interface RequestResult {
    prompt?: string;
    response?: string;
    model?: string;
    gptPrompt?: string;
    error?: string;
    maxTokens?: number;
    n?: number;
    stop?: string | null;
    temperature?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    echo?: boolean;
    data?:any;
  }
  