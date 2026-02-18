import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { resolveDamage, rollDice } from '../_shared/damage.ts';
import type { GameState, PartName } from '../_shared/types.ts';

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const { room_id, weapon_card_id, target_user_id, target_part } = await req.json();

  const { data: gs } = await supabase.from('game_state').select('*').eq('room_id', room_id).single();
  if (!gs) return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  const state: GameState = gs.state;
  if (state.active_player_id !== user.id) return new Response(JSON.stringify({ error: 'Not your turn' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  if (state.phase !== 'combat') return new Response(JSON.stringify({ error: 'Not combat phase' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const attacker = state.players[user.id];
  if (attacker.ap < 1) return new Response(JSON.stringify({ error: 'No AP' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  // Find the weapon in installed components
  let weaponStats: any = null;
  outer: for (const part of Object.values(attacker.parts)) {
    for (const comp of part.installed_components) {
      if (comp.card_id === weapon_card_id && comp.is_active) {
        const { data: cd } = await supabase.from('card_definitions').select('stats').eq('id', weapon_card_id).single();
        weaponStats = cd?.stats;
        break outer;
      }
    }
  }
  if (!weaponStats) return new Response(JSON.stringify({ error: 'Weapon not found or not active' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  // Determine target part
  let resolvedPart: PartName = target_part;
  if (!attacker.targeting_system || attacker.status_effects.some(se => se.effect === 'jammed')) {
    const parts: PartName[] = ['head','torso','left_arm','right_arm','left_leg','right_leg'];
    resolvedPart = parts[Math.floor(Math.random() * parts.length)];
  }

  // Damage calculation
  let damage = rollDice(weaponStats.damage);
  const overclock = attacker.status_effects.find(se => se.effect === 'energized');
  if (overclock) damage = Math.round(damage * 1.2);

  const targetPlayer = state.players[target_user_id];
  if (!targetPlayer || targetPlayer.is_eliminated) return new Response(JSON.stringify({ error: 'Invalid target' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  if (targetPlayer.status_effects.some(se => se.effect === 'marked')) damage = Math.round(damage * 1.2);

  const result = resolveDamage(targetPlayer, damage, resolvedPart, weaponStats.energy_type ?? 'kinetic');
  state.players[target_user_id] = result.targetState;
  attacker.ap -= 1;
  state.log.push(`${user.id} fired ${weapon_card_id} at ${target_user_id}:${resolvedPart} for ${damage} damage`);

  if (result.eliminated) {
    state.log.push(`${target_user_id} has been eliminated!`);
  }

  const { error: updateError } = await supabase.from('game_state').update({ state, updated_at: new Date().toISOString() }).eq('room_id', room_id);
  if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ damage, targetPart: resolvedPart, eliminated: result.eliminated }), { headers: { 'Content-Type': 'application/json' } });
});
