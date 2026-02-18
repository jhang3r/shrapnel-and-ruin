import { redirect, fail } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) redirect(303, '/auth');

  const [{ data: incoming }, { data: outgoing }] = await Promise.all([
    locals.supabase.from('trades')
      .select('id, initiator_id, offered_card_ids, requested_card_ids, status, created_at, profiles!initiator_id(username)')
      .eq('recipient_id', user.id)
      .eq('status', 'pending'),
    locals.supabase.from('trades')
      .select('id, recipient_id, offered_card_ids, requested_card_ids, status, created_at, profiles!recipient_id(username)')
      .eq('initiator_id', user.id)
      .in('status', ['pending', 'accepted', 'rejected'])
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  return { incoming: incoming ?? [], outgoing: outgoing ?? [], userId: user.id };
};

export const actions: Actions = {
  accept: async ({ locals, request }) => {
    const { user } = await locals.safeGetSession();
    if (!user) redirect(303, '/auth');

    const form = await request.formData();
    const tradeId = form.get('trade_id') as string;
    if (!tradeId) return fail(400, { message: 'Missing trade_id' });

    const { data: { session } } = await locals.supabase.auth.getSession();
    const res = await fetch(`${PUBLIC_SUPABASE_URL}/functions/v1/respond-trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ trade_id: tradeId, accept: true })
    });
    const result = await res.json();
    if (result.error) return fail(400, { message: result.error });
    return { success: true };
  },

  reject: async ({ locals, request }) => {
    const { user } = await locals.safeGetSession();
    if (!user) redirect(303, '/auth');

    const form = await request.formData();
    const tradeId = form.get('trade_id') as string;
    if (!tradeId) return fail(400, { message: 'Missing trade_id' });

    const { data: { session } } = await locals.supabase.auth.getSession();
    const res = await fetch(`${PUBLIC_SUPABASE_URL}/functions/v1/respond-trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ trade_id: tradeId, accept: false })
    });
    const result = await res.json();
    if (result.error) return fail(400, { message: result.error });
    return { success: true };
  }
};
