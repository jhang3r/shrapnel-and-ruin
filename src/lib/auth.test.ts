import { describe, it, expect } from 'vitest';

describe('generateGuestUsername', () => {
  it('always matches Pilot-XXXX format across many calls', async () => {
    const { generateGuestUsername } = await import('./auth');
    for (let i = 0; i < 1000; i++) {
      expect(generateGuestUsername()).toMatch(/^Pilot-[A-Z0-9]{4}$/);
    }
  });
});
