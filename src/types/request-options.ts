import { ChatCompletionRequestMessage, CreateChatCompletionRequestStop } from "openai";

export interface RequestOptions {
  model?: string;
  prompt: string;
  promptType?: 'chat' | 'completion';
  maxTokens?: number;
  temperature?: number;
  top_p?: number | null;
  n?: number | null;
  stream?: boolean | null;
  stop?: CreateChatCompletionRequestStop | undefined;
  presence_penalty?: number | null;
  frequency_penalty?: number | null;
  logit_bias?: object | null;
  user?: string;
  messages?: Array<ChatCompletionRequestMessage>;
}