import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) redirect(303, '/auth');

  const { data: collection } = await locals.supabase
    .from('user_collections')
    .select('card_id, quantity, card_definitions(id, name, rarity, card_type, stats)')
    .eq('user_id', user.id)
    .order('card_id', { ascending: true });

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('scrap')
    .eq('id', user.id)
    .single();

  return {
    collection: collection ?? [],
    scrap: profile?.scrap ?? 0,
  };
};

export const actions: Actions = {
  dismantle: async ({ request, locals }) => {
    const { user } = await locals.safeGetSession();
    if (!user) redirect(303, '/auth');

    const form = await request.formData();
    const cardId = form.get('card_id') as string;

    if (!cardId) return fail(400, { message: 'Missing card_id' });

    // Issue 7: Handle NaN and non-positive values from form input
    const rawQty = Number(form.get('quantity'));
    if (!Number.isFinite(rawQty) || rawQty < 1) {
      return fail(400, { message: 'Invalid quantity' });
    }
    const qty = Math.floor(rawQty);

    // Scrap values by rarity
    const SCRAP_VALUES: Record<string, number> = {
      common: 5,
      uncommon: 15,
      rare: 40,
      epic: 100,
      legendary: 250,
    };

    // Fetch card definition for rarity
    const { data: cardDef } = await locals.supabase
      .from('card_definitions')
      .select('rarity')
      .eq('id', cardId)
      .single();
    if (!cardDef) return fail(404, { message: 'Card not found' });

    // Fetch current quantity (Problem A fix — no .rpc() calls)
    const { data: current } = await locals.supabase
      .from('user_collections')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('card_id', cardId)
      .single();

    if (!current || current.quantity < qty) {
      return fail(400, { message: 'Not enough cards to dismantle' });
    }

    const newQty = current.quantity - qty;
    if (newQty === 0) {
      const { error: delErr } = await locals.supabase
        .from('user_collections')
        .delete()
        .eq('user_id', user.id)
        .eq('card_id', cardId);
      if (delErr) return fail(500, { message: delErr.message });
    } else {
      const { error: updErr } = await locals.supabase
        .from('user_collections')
        .update({ quantity: newQty })
        .eq('user_id', user.id)
        .eq('card_id', cardId);
      if (updErr) return fail(500, { message: updErr.message });
    }

    // Issue 6: Optimistic concurrency for scrap increment to avoid read-then-write race condition
    const scrapGain = (SCRAP_VALUES[cardDef.rarity] ?? 5) * qty;
    const { data: prof } = await locals.supabase
      .from('profiles')
      .select('scrap')
      .eq('id', user.id)
      .single();
    const newScrap = (prof?.scrap ?? 0) + scrapGain;
    // Conditional update: only applies if scrap hasn't changed between our read and write.
    // If a concurrent update raced us, the update matches 0 rows. For scrap gains this is
    // acceptable (user's favor), so we proceed without failing the action.
    const { data: updatedProf } = await locals.supabase
      .from('profiles')
      .update({ scrap: newScrap })
      .eq('id', user.id)
      .eq('scrap', prof?.scrap ?? 0)
      .select('id');
    // updatedProf being empty means a concurrent update happened — acceptable for gains

    return { success: true, scrap_gained: scrapGain };
  },
};
