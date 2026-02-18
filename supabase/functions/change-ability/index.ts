import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { GameState } from '../_shared/types.ts';

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const { room_id, ability } = await req.json();

  // Membership check
  const { data: membership } = await supabase.from('game_players').select('user_id').eq('room_id', room_id).eq('user_id', user.id).maybeSingle();
  if (!membership) return new Response(JSON.stringify({ error: 'Not a participant' }), { status: 403, headers: { 'Content-Type': 'application/json' } });

  const { data: gs } = await supabase.from('game_state').select('*').eq('room_id', room_id).single();
  const state: GameState = gs?.state;
  if (!state || state.active_player_id !== user.id) return new Response(JSON.stringify({ error: 'Not your turn' }), { status: 403, headers: { 'Content-Type': 'application/json' } });

  // Room status check
  const { data: room } = await supabase.from('game_rooms').select('status').eq('id', room_id).single();
  if (!room || room.status !== 'in_progress') return new Response(JSON.stringify({ error: 'Game not in progress' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const player = state.players[user.id];

  if (ability === 'Shield Boost') {
    if (player.ap < 1) return new Response(JSON.stringify({ error: 'No AP' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    // Issue 5: Prevent Shield Boost from silently no-oping when no shield is equipped
    if (!player.shield) return new Response(JSON.stringify({ error: 'No shield equipped' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    player.ap -= 1;
    player.shield.sp = Math.min(player.shield.max_sp, player.shield.sp + player.shield.regen);
    state.log.push(`${user.id} used Shield Boost`);
  } else if (ability === 'Weapon Overclock') {
    if (player.ap < 1) return new Response(JSON.stringify({ error: 'No AP' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    player.ap -= 1;
    player.status_effects.push({ effect: 'energized', turns_remaining: 1 });
    state.log.push(`${user.id} used Weapon Overclock`);
  } else {
    return new Response(JSON.stringify({ error: 'Unknown ability' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Issue 4: Check DB write error and return 500 on failure
  const { error: gsUpdateErr } = await supabase.from('game_state').update({ state, updated_at: new Date().toISOString() }).eq('room_id', room_id);
  if (gsUpdateErr) return new Response(JSON.stringify({ error: 'Failed to save game state' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});
