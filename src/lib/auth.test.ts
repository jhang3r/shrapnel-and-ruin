import { describe, it, expect } from 'vitest';

describe('generateGuestUsername', () => {
  it('returns a string matching Pilot-XXXX format', async () => {
    const { generateGuestUsername } = await import('./auth');
    const name = generateGuestUsername();
    expect(name).toMatch(/^Pilot-[A-Z0-9]{4}$/);
  });
});
