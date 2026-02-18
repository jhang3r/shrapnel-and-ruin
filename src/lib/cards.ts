export const DECK_SIZE = 60;
export const MAX_COPIES = 4;
export const MAX_LEGENDARY = 1;
export const POINT_BUDGET = 100;

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface DeckEntry {
  id: string;
  rarity: Rarity;
  point_cost: number;
  quantity: number;
}

export function validateDeck(cards: DeckEntry[]): string | null {
  for (const card of cards) {
    if (!Number.isInteger(card.quantity) || card.quantity < 1) {
      return `${card.id}: quantity must be a positive integer`;
    }
    if (card.quantity > MAX_COPIES) return `${card.id}: max 4 copies allowed`;
  }

  const legendaryCount = cards.filter(c => c.rarity === 'legendary').reduce((s, c) => s + c.quantity, 0);
  if (legendaryCount > MAX_LEGENDARY) return `Deck has max 1 legendary`;

  const totalPoints = cards.reduce((sum, c) => sum + c.point_cost * c.quantity, 0);
  if (totalPoints > POINT_BUDGET) return `Deck exceeds 100-point budget (${totalPoints} pts)`;

  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);
  if (totalCards !== DECK_SIZE) return `Deck must contain exactly 60 cards (has ${totalCards})`;

  return null;
}
