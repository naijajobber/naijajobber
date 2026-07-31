import { computeProfileCompletionPercent } from './profile-completion.util';

describe('computeProfileCompletionPercent', () => {
  it('returns 0 for empty profile', () => {
    expect(computeProfileCompletionPercent({})).toBe(0);
  });

  it('scores photo + bio + contact', () => {
    const pct = computeProfileCompletionPercent({
      avatarUrl: 'https://cdn/x.png',
      bio: 'Hello',
      phone: '+234',
    });
    // 8+10+8 = 26 of 100
    expect(pct).toBe(26);
  });

  it('reaches 100 when all sections filled', () => {
    expect(
      computeProfileCompletionPercent({
        avatarUrl: 'a',
        bio: 'b',
        phone: '1',
        skills: ['TS'],
        experience: [{}],
        education: [{}],
        cvFiles: [{}],
        languages: [{}],
        portfolioLinks: ['https://x'],
        certificates: [{}],
      }),
    ).toBe(100);
  });
});
