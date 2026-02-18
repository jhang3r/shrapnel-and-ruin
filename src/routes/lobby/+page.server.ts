import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) redirect(303, '/auth');

  const { data: decks } = await locals.supabase
    .from('decks')
    .select('id, name')
    .eq('user_id', user.id);

  return { decks: decks ?? [], user };
};
