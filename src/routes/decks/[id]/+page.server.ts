import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { validateDeck } from '$lib/cards';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { user } = await locals.safeGetSession();
  if (!user) redirect(303, '/auth');

  const [{ data: deck }, { data: allCards }, { data: deckCards }] = await Promise.all([
    locals.supabase.from('decks').select('*').eq('id', params.id).eq('user_id', user.id).single(),
    locals.supabase.from('card_definitions').select('*').order('type').order('name'),
    locals.supabase.from('deck_cards').select('card_id, quantity').eq('deck_id', params.id)
  ]);

  if (!deck) redirect(303, '/decks');

  return { deck, allCards: allCards ?? [], deckCards: deckCards ?? [] };
};

export const actions: Actions = {
  setCard: async ({ locals, params, request }) => {
    const { user } = await locals.safeGetSession();
    if (!user) redirect(303, '/auth');

    const form = await request.formData();
    const cardId = form.get('card_id') as string;
    const qty = parseInt(form.get('quantity') as string, 10);

    if (qty <= 0) {
      await locals.supabase.from('deck_cards').delete()
        .eq('deck_id', params.id).eq('card_id', cardId);
    } else {
      await locals.supabase.from('deck_cards').upsert(
        { deck_id: params.id, card_id: cardId, quantity: qty },
        { onConflict: 'deck_id,card_id' }
      );
    }
  },

  rename: async ({ locals, params, request }) => {
    const { user } = await locals.safeGetSession();
    if (!user) redirect(303, '/auth');
    const form = await request.formData();
    const name = form.get('name') as string;
    await locals.supabase.from('decks').update({ name }).eq('id', params.id).eq('user_id', user.id);
  },

  validate: async ({ locals, params }) => {
    const { data: deckCards } = await locals.supabase
      .from('deck_cards')
      .select('card_id, quantity, card_definitions(rarity, point_cost)')
      .eq('deck_id', params.id);

    const entries = (deckCards ?? []).map(dc => ({
      id: dc.card_id,
      rarity: (dc.card_definitions as any).rarity,
      point_cost: (dc.card_definitions as any).point_cost,
      quantity: dc.quantity
    }));

    const error = validateDeck(entries);
    if (error) return fail(400, { validationError: error });
    return { valid: true };
  }
};
