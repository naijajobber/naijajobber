import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider } from './ai-provider.interface';
import { MockAiProvider } from './mock-ai.provider';
import { OpenAiCompatibleProvider } from './openai-compatible.provider';

@Injectable()
export class AiRouterService {
  constructor(
    private readonly config: ConfigService,
    private readonly mock: MockAiProvider,
    private readonly openai: OpenAiCompatibleProvider,
  ) {}

  resolve(): AiProvider {
    const mode = this.config.get<string>('ai.mode') || 'mock';
    const key = this.config.get<string>('ai.openaiApiKey') || '';
    if (mode === 'mock' || !key) {
      return this.mock;
    }
    return this.openai;
  }
}
