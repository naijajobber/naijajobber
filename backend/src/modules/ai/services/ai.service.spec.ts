import { MockAiProvider } from '../../../infrastructure/ai/mock-ai.provider';
import { AiService } from './ai.service';

describe('AiService + MockAiProvider', () => {
  it('mock provider returns resume JSON', async () => {
    const provider = new MockAiProvider();
    const result = await provider.complete({
      mode: 'json',
      system: 'resume review',
      user: 'Experienced engineer with remote collaboration skills...',
    });
    const parsed = JSON.parse(result.content);
    expect(parsed.strengths).toBeDefined();
    expect(parsed.score).toBeGreaterThan(0);
  });

  it('asserts rate limit when hourly exceeded', async () => {
    const redis = {
      get: jest.fn().mockResolvedValue('99'),
      incr: jest.fn(),
    };
    const service = new AiService(
      { countToday: jest.fn().mockResolvedValue(0) } as never,
      {} as never,
      redis as never,
      {} as never,
      {} as never,
      {
        get: (k: string) => (k.includes('hourly') ? 10 : 20),
      } as never,
      {} as never,
    );

    await expect(
      service.reviewResume('507f1f77bcf86cd799439011', {
        resumeText: 'A'.repeat(40),
      }),
    ).rejects.toMatchObject({ status: 429 });
  });

  it('mock resume parser extracts skills and contact', async () => {
    const create = jest.fn().mockResolvedValue({ _id: 'run1' });
    const redis = {
      get: jest.fn().mockResolvedValue('0'),
      incr: jest.fn().mockResolvedValue(1),
    };
    const service = new AiService(
      {
        countToday: jest.fn().mockResolvedValue(0),
        create,
      } as never,
      {} as never,
      redis as never,
      {} as never,
      {} as never,
      {
        get: (k: string) => (k.includes('hourly') ? 100 : 1000),
      } as never,
      {} as never,
    );

    const result = await service.parseResume('507f1f77bcf86cd799439011', {
      resumeText:
        'Jane Doe\njane@example.com\n+2348012345678\nSkills: typescript react node aws',
      fileName: 'jane_doe_cv.pdf',
    });

    expect(result.email).toBe('jane@example.com');
    expect(result.skills).toEqual(
      expect.arrayContaining(['Typescript', 'React', 'Node', 'Aws']),
    );
    expect(result.certificates.length).toBeGreaterThan(0);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'RESUME_PARSE' }),
    );
  });
});
