import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { user } = await locals.safeGetSession();
  if (!user) redirect(303, '/auth');

  const [{ data: room }, { data: players }, { data: gs }] = await Promise.all([
    locals.supabase.from('game_rooms').select('*').eq('id', params.id).single(),
    locals.supabase.from('game_players').select('user_id, is_ready, profiles(username)').eq('room_id', params.id),
    locals.supabase.from('game_state').select('*').eq('room_id', params.id).maybeSingle()
  ]);

  if (!room) redirect(303, '/lobby');

  return { room, players: players ?? [], gameState: gs?.state ?? null, userId: user.id };
};
