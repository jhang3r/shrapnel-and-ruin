import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { advanceTurn, applyUpkeep } from '../_shared/game-engine.ts';
import type { GameState } from '../_shared/types.ts';

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const { room_id } = await req.json();

  const { data: gs } = await supabase.from('game_state').select('*').eq('room_id', room_id).single();
  if (!gs) return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  let state: GameState = gs.state;
  if (state.active_player_id !== user.id) return new Response(JSON.stringify({ error: 'Not your turn' }), { status: 403, headers: { 'Content-Type': 'application/json' } });

  // Check if only one player remains
  const living = state.turn_order.filter(uid => !state.players[uid].is_eliminated);
  if (living.length === 1) {
    await supabase.from('game_rooms').update({ status: 'completed' }).eq('id', room_id);
    await supabase.from('match_history').insert({ room_id, winner_id: living[0] });
    state.log.push(`Game over! Winner: ${living[0]}`);
    await supabase.from('game_state').update({ state, phase: 'end', updated_at: new Date().toISOString() }).eq('room_id', room_id);
    return new Response(JSON.stringify({ game_over: true, winner: living[0] }), { headers: { 'Content-Type': 'application/json' } });
  }

  state = advanceTurn(state);
  state = applyUpkeep(state);

  const { error: updateError } = await supabase.from('game_state').update({ state, phase: state.phase, turn_number: state.turn_number, active_player_id: state.active_player_id, updated_at: new Date().toISOString() }).eq('room_id', room_id);
  if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});
