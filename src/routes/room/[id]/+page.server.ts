import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { user } = await locals.safeGetSession();
  if (!user) redirect(303, '/auth');

  const [
    { data: room, error: roomError },
    { data: players },
    { data: gs },
    { data: allCards }
  ] = await Promise.all([
    locals.supabase.from('game_rooms').select('*').eq('id', params.id).single(),
    locals.supabase.from('game_players').select('user_id, is_ready, profiles(username)').eq('room_id', params.id),
    locals.supabase.from('game_state').select('*').eq('room_id', params.id).maybeSingle(),
    locals.supabase.from('card_definitions').select('*')
  ]);

  const cardDefs = Object.fromEntries((allCards ?? []).map((c: any) => [c.id, c]));

  if (roomError && roomError.code !== 'PGRST116') throw error(500, 'Failed to load room');
  if (!room) redirect(303, '/lobby');

  return { room, players: players ?? [], gameState: gs?.state ?? null, userId: user.id, cardDefs };
};
