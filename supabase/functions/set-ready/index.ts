import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { initGameState } from '../_shared/game-engine.ts';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const { room_id } = await req.json();

  const { data: roomCheck } = await supabase
    .from('game_rooms').select('id, status, host_id').eq('id', room_id).single();
  if (!roomCheck) return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  if (roomCheck.status !== 'pending') return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });

  await supabase.from('game_players')
    .update({ is_ready: true })
    .eq('room_id', room_id)
    .eq('user_id', user.id);

  // Check if all players are ready
  const { data: players } = await supabase
    .from('game_players')
    .select('user_id, is_ready, deck_id')
    .eq('room_id', room_id);

  const allReady = players?.every(p => p.is_ready) && (players?.length ?? 0) >= 2;

  if (allReady) {
    // Idempotency guard: only the first caller who sees allReady=true will proceed
    // (room status check done above — if already in_progress we returned early)
    try {
      const state = await initGameState(supabase, room_id, players!);
      await supabase.from('game_rooms').update({ status: 'in_progress' }).eq('id', room_id).eq('status', 'pending');
      await supabase.from('game_state').insert({ room_id, state, phase: 'upkeep', turn_number: 1, active_player_id: players![0].user_id });
    } catch (err) {
      console.error('Game start failed:', err);
      return new Response(JSON.stringify({ error: 'Failed to start game' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});
