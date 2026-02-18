// Starter deck: 15 card types × 4 copies = 60 cards, exactly 100 points
const STARTER_CARDS: { card_id: string; quantity: number }[] = [
  { card_id: 'frame-scout',      quantity: 4 },
  { card_id: 'comp-targeting',   quantity: 4 },
  { card_id: 'comp-hydraulic',   quantity: 4 },
  { card_id: 'comp-power-relay', quantity: 4 },
  { card_id: 'comp-shield-gen',  quantity: 4 },
  { card_id: 'act-overclock',    quantity: 4 },
  { card_id: 'act-shield-boost', quantity: 4 },
  { card_id: 'act-emergency-rep',quantity: 4 },
  { card_id: 'act-scan',         quantity: 4 },
  { card_id: 'eng-capacitor',    quantity: 4 },
  { card_id: 'eng-fusion-cell',  quantity: 4 },
  { card_id: 'eng-reserve',      quantity: 4 },
  { card_id: 'arm-plating-light',quantity: 4 },
  { card_id: 'arm-plating-heavy',quantity: 4 },
  { card_id: 'arm-buckler',      quantity: 4 },
];

export async function createStarterDeck(supabase: any, userId: string): Promise<void> {
  const { data: deck, error: deckErr } = await supabase
    .from('decks')
    .insert({ user_id: userId, name: 'Starter Deck', is_starter: true })
    .select('id')
    .single();

  if (deckErr || !deck) {
    console.error('Failed to create starter deck:', deckErr?.message);
    return;
  }

  const deckCards = STARTER_CARDS.map(c => ({ deck_id: deck.id, ...c }));
  const { error: cardsErr } = await supabase.from('deck_cards').insert(deckCards);
  if (cardsErr) console.error('Failed to insert starter deck cards:', cardsErr.message);
}
