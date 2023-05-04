export interface RequestOptions {
    endpoint: string;
    prompt: string;
    model?: string;
    maxTokens?: number;
    n?: number;
    stop?: string | null;
    temperature?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    echo?: boolean;
  }
  