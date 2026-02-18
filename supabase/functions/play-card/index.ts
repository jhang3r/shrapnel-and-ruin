import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { GameState } from '../_shared/types.ts';

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const { room_id, card_id, target_part, install_part } = await req.json();

  const { data: gs } = await supabase.from('game_state').select('*').eq('room_id', room_id).single();
  if (!gs) return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  const state: GameState = gs.state;
  if (state.active_player_id !== user.id) return new Response(JSON.stringify({ error: 'Not your turn' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  if (state.phase !== 'build') return new Response(JSON.stringify({ error: 'Not build phase' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const player = state.players[user.id];
  const cardIdx = player.hand.indexOf(card_id);
  if (cardIdx === -1) return new Response(JSON.stringify({ error: 'Card not in hand' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  // Fetch card definition
  const { data: cardDef } = await supabase.from('card_definitions').select('*').eq('id', card_id).single();
  if (!cardDef) return new Response(JSON.stringify({ error: 'Unknown card' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  // Remove from hand
  player.hand.splice(cardIdx, 1);

  if (cardDef.type === 'frame') {
    player.frame_card_id = card_id;
    player.ap_per_turn = cardDef.stats.base_ap;
    player.discard.push(card_id);
  } else if (cardDef.type === 'component' && install_part) {
    const part = player.parts[install_part as keyof typeof player.parts];
    part.installed_components.push({ card_id, hp: 20, max_hp: 20, is_active: true });
    if (cardDef.stats.slot_type === 'targeting') player.targeting_system = true;
    if (cardDef.stats.slot_type === 'shield') {
      player.shield = { sp: cardDef.stats.shield_points, max_sp: cardDef.stats.shield_points, regen: cardDef.stats.regen_per_upkeep, resist_profile: cardDef.stats.resist_profile ?? {} };
    }
  } else if (cardDef.type === 'energy') {
    player.ap += cardDef.stats.ap_grant ?? 1;
    player.discard.push(card_id);
  } else if (cardDef.type === 'armor' && install_part) {
    const part = player.parts[install_part as keyof typeof player.parts];
    part.armor += cardDef.stats.armor_points ?? 0;
    player.discard.push(card_id);
  } else if (cardDef.type === 'action') {
    player.discard.push(card_id);
  }

  // Cost 1 AP to play a card
  player.ap = Math.max(0, player.ap - 1);
  state.log.push(`${user.id} played ${cardDef.name}`);

  const { error: updateError } = await supabase.from('game_state').update({ state, updated_at: new Date().toISOString() }).eq('room_id', room_id);
  if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});
