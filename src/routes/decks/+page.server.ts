import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) redirect(303, '/auth');

  const { data: decks } = await locals.supabase
    .from('decks')
    .select('id, name, is_starter, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return { decks: decks ?? [] };
};

export const actions: Actions = {
  create: async ({ locals }) => {
    const { user } = await locals.safeGetSession();
    if (!user) redirect(303, '/auth');

    const { data: deck, error } = await locals.supabase
      .from('decks')
      .insert({ user_id: user.id, name: 'New Deck' })
      .select('id')
      .single();

    if (error || !deck) {
      console.error('Deck create error:', error);
      return fail(500, { message: error?.message ?? 'Failed to create deck' });
    }
    redirect(303, `/decks/${deck.id}`);
  }
};
