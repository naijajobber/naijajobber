import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiCompleteInput,
  AiCompleteResult,
  AiProvider,
} from './ai-provider.interface';

@Injectable()
export class OpenAiCompatibleProvider implements AiProvider {
  readonly name = 'openai';
  private readonly logger = new Logger(OpenAiCompatibleProvider.name);

  constructor(private readonly config: ConfigService) {}

  async complete(input: AiCompleteInput): Promise<AiCompleteResult> {
    const apiKey = this.config.get<string>('ai.openaiApiKey') || '';
    if (!apiKey) {
      throw new ServiceUnavailableException('OPENAI_API_KEY is not configured');
    }

    const baseUrl = (
      this.config.get<string>('ai.openaiBaseUrl') || 'https://api.openai.com/v1'
    ).replace(/\/$/, '');
    const model = this.config.get<string>('ai.openaiModel') || 'gpt-4o-mini';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: input.system },
          { role: 'user', content: input.user },
        ],
        temperature: 0.4,
        ...(input.mode === 'json'
          ? { response_format: { type: 'json_object' } }
          : {}),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`OpenAI error ${response.status}: ${errText}`);
      throw new ServiceUnavailableException('AI provider request failed');
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { total_tokens?: number };
      model?: string;
    };

    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || model,
      tokensUsed: data.usage?.total_tokens || 0,
      provider: this.name,
    };
  }
}
