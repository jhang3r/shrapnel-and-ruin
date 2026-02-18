import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { GameState } from '../_shared/types.ts';

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const { room_id, card_id } = await req.json();

  const { data: membership } = await supabase
    .from('game_players')
    .select('user_id')
    .eq('room_id', room_id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!membership) {
    return new Response(JSON.stringify({ error: 'Not a participant' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: gs } = await supabase.from('game_state').select('*').eq('room_id', room_id).single();
  const state: GameState = gs?.state;
  if (!state) return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  const { data: room } = await supabase
    .from('game_rooms')
    .select('status')
    .eq('id', room_id)
    .single();
  if (!room || room.status !== 'in_progress') {
    return new Response(JSON.stringify({ error: 'Game is not in progress' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (state.active_player_id !== user.id) return new Response(JSON.stringify({ error: 'Not your turn' }), { status: 403, headers: { 'Content-Type': 'application/json' } });

  if (state.phase !== 'build' && state.phase !== 'combat') {
    return new Response(JSON.stringify({ error: 'Can only discard during build or combat phase' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const player = state.players[user.id];
  const idx = player.hand.indexOf(card_id);
  if (idx === -1) return new Response(JSON.stringify({ error: 'Card not in hand' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const { data: cardDef } = await supabase.from('card_definitions').select('discard_effect, name').eq('id', card_id).single();
  player.hand.splice(idx, 1);
  player.discard.push(card_id);

  state.log.push(`${user.id} discarded ${cardDef?.name} for its effect`);

  const { error: updateError } = await supabase.from('game_state').update({ state, updated_at: new Date().toISOString() }).eq('room_id', room_id);
  if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ ok: true, effect: cardDef?.discard_effect }), { headers: { 'Content-Type': 'application/json' } });
});
