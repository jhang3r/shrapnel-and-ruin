import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { aiChooseAction } from '../_shared/ai-player.ts';
import { resolveDamage, rollDice } from '../_shared/damage.ts';
import type { GameState } from '../_shared/types.ts';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { room_id, ai_user_id, difficulty = 'normal' } = await req.json();
  if (!room_id || !ai_user_id) {
    return new Response(JSON.stringify({ error: 'Missing room_id or ai_user_id' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // Verify caller is a member of this room
  const { data: membership } = await supabase
    .from('game_players')
    .select('user_id')
    .eq('room_id', room_id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!membership) {
    return new Response(JSON.stringify({ error: 'Not a member of this room' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // Validate ai_user_id is actually an AI slot
  if (!ai_user_id?.startsWith('ai-')) {
    return new Response(JSON.stringify({ error: 'Invalid AI user ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: gs, error: gsErr } = await supabase.from('game_state').select('*').eq('room_id', room_id).single();
  if (gsErr || !gs) {
    const status = gsErr && gsErr.code !== 'PGRST116' ? 500 : 404;
    const message = gsErr && gsErr.code !== 'PGRST116' ? 'Failed to load game state' : 'Game not found';
    return new Response(JSON.stringify({ error: message }), {
      status, headers: { 'Content-Type': 'application/json' }
    });
  }

  let state: GameState = gs.state;
  if (state.active_player_id !== ai_user_id) {
    return new Response(JSON.stringify({ ok: false, reason: 'Not this AI turn' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: cardDefs, error: cardErr } = await supabase.from('card_definitions').select('*');
  if (cardErr) {
    return new Response(JSON.stringify({ error: 'Failed to load card definitions' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
  const cardDefMap = Object.fromEntries((cardDefs ?? []).map((c: any) => [c.id, c]));

  // Run AI actions until no more available or turn ends
  let iterations = 0;
  while (state.active_player_id === ai_user_id && iterations < 20) {
    const action = aiChooseAction(state, ai_user_id, difficulty, cardDefMap);
    if (!action) {
      // Advance phase: build → combat; combat → end turn (handled externally)
      if (state.phase === 'build') {
        state.phase = 'combat';
      } else {
        break; // Let end-turn be handled by the regular end-turn endpoint
      }
      iterations++;
      continue;
    }

    // Apply attack action
    if (action.action === 'attack') {
      const attacker = state.players[ai_user_id];
      if (attacker && attacker.ap >= 1) {
        attacker.ap -= 1;
        const { weapon_card_id, target_user_id, target_part } = action.params;
        const weaponStats = cardDefMap[weapon_card_id]?.stats;
        if (weaponStats && state.players[target_user_id]) {
          const damage = rollDice(weaponStats.damage ?? '1d6');
          const result = resolveDamage(
            state.players[target_user_id],
            damage,
            target_part,
            weaponStats.energy_type ?? 'kinetic'
          );
          state.players[target_user_id] = result.targetState;
        }
      }
    } else if (action.action === 'play-card') {
      // Minimal: deduct AP for the card play (full card effects handled by play-card endpoint)
      const attacker = state.players[ai_user_id];
      if (attacker && attacker.ap >= 1) {
        attacker.ap -= 1;
      }
    }

    const currentAp = state.players[ai_user_id]?.ap ?? 0;
    if (currentAp <= 0) break;

    iterations++;
  }

  const { error: saveErr } = await supabase
    .from('game_state')
    .update({ state, updated_at: new Date().toISOString() })
    .eq('room_id', room_id);

  if (saveErr) {
    return new Response(JSON.stringify({ error: 'Failed to save game state' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
