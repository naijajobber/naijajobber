export type AiCompleteMode = 'text' | 'json';

export interface AiCompleteInput {
  system: string;
  user: string;
  mode?: AiCompleteMode;
}

export interface AiCompleteResult {
  content: string;
  model: string;
  tokensUsed: number;
  provider: string;
}

export interface AiProvider {
  readonly name: string;
  complete(input: AiCompleteInput): Promise<AiCompleteResult>;
}
