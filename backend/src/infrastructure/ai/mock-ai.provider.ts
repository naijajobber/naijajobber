import { Injectable } from '@nestjs/common';
import {
  AiCompleteInput,
  AiCompleteResult,
  AiProvider,
} from './ai-provider.interface';

@Injectable()
export class MockAiProvider implements AiProvider {
  readonly name = 'mock';

  async complete(input: AiCompleteInput): Promise<AiCompleteResult> {
    const lower = `${input.system}\n${input.user}`.toLowerCase();
    let content: string;

    if (lower.includes('resume') || lower.includes('review')) {
      content = JSON.stringify({
        strengths: [
          'Clear remote-work experience',
          'Quantified impact in recent roles',
        ],
        gaps: [
          'Add more metrics to project bullets',
          'Highlight African timezone collaboration',
        ],
        rewriteTips: [
          'Lead with outcomes, not duties',
          'Mirror keywords from the target job description',
        ],
        score: 78,
      });
    } else if (lower.includes('cover')) {
      content = JSON.stringify({
        letter: `Dear Hiring Manager,\n\nI am excited to apply for this role. My background in remote collaboration and delivering measurable results aligns with your needs.\n\nThank you for your consideration.\n\nBest regards`,
      });
    } else if (lower.includes('match')) {
      content = JSON.stringify({
        scores: [
          { index: 0, score: 88, reason: 'Strong skill overlap' },
          { index: 1, score: 72, reason: 'Partial skill match' },
          { index: 2, score: 55, reason: 'Adjacent experience' },
        ],
      });
    } else {
      content =
        input.mode === 'json'
          ? JSON.stringify({ message: 'Mock AI response' })
          : 'Mock AI response';
    }

    return {
      content,
      model: 'mock-ai-v1',
      tokensUsed: 120,
      provider: this.name,
    };
  }
}
