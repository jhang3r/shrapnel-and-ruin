import { describe, it, expect } from 'vitest';
import { validateDeck, DECK_SIZE, MAX_COPIES, MAX_LEGENDARY, POINT_BUDGET, Rarity } from './cards';

const makeCard = (id: string, rarity: Rarity, cost: number, qty: number) =>
  ({ id, rarity, point_cost: cost, quantity: qty });

describe('validateDeck', () => {
  it('requires exactly 60 cards', () => {
    // 59 cards total (no copies violation, no legendary violation, no points violation)
    const cards = Array.from({ length: 59 }, (_, i) => makeCard(`C${i}`, 'common', 1, 1));
    expect(validateDeck(cards)).toContain('must contain exactly 60 cards');
  });

  it('rejects more than 4 copies of a card', () => {
    const cards = [makeCard('A', 'common', 1, 5)];
    expect(validateDeck(cards)).toContain('max 4 copies');
  });

  it('rejects more than 1 legendary', () => {
    const cards = [
      makeCard('LEG1', 'legendary', 10, 1),
      makeCard('LEG2', 'legendary', 10, 1),
      ...Array.from({ length: 58 }, (_, i) => makeCard(`C${i}`, 'common', 1, 1))
    ];
    expect(validateDeck(cards)).toContain('max 1 legendary');
  });

  it('rejects over 100 point budget', () => {
    // 10 epics at 10pts + 50 commons at 1pt = 150pts total — well over 100pt budget
    const cards = [
      ...Array.from({ length: 10 }, (_, i) => makeCard(`E${i}`, 'epic', 10, 1)),
      ...Array.from({ length: 50 }, (_, i) => makeCard(`C${i}`, 'common', 1, 1))
    ];
    expect(validateDeck(cards)).toContain('100-point budget');
  });

  it('accepts a valid deck', () => {
    // 60 unique commons at 1pt each = 60 cards, 60pts total
    const cards = Array.from({ length: 60 }, (_, i) => makeCard(`C${i}`, 'common', 1, 1));
    expect(validateDeck(cards)).toBeNull();
  });
});
