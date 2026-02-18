import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { GameState } from '../_shared/types.ts';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { room_id, target_user_id, card_id } = await req.json();

  // Membership check
  const { data: membership } = await supabase
    .from('game_players').select('user_id').eq('room_id', room_id).eq('user_id', user.id).maybeSingle();
  if (!membership) {
    return new Response(JSON.stringify({ error: 'Not a participant' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: gs } = await supabase.from('game_state').select('*').eq('room_id', room_id).single();
  const state: GameState = gs?.state;
  if (!state) {
    return new Response(JSON.stringify({ error: 'Game not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Issue 8: Turn-order check — salvage may only happen on your turn
  if (state.active_player_id !== user.id) {
    return new Response(JSON.stringify({ error: 'Not your turn' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Target must be eliminated
  const target = state.players[target_user_id];
  if (!target?.is_eliminated) {
    return new Response(JSON.stringify({ error: 'Target not eliminated' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Issue 1: Validate card_id exists in target's deck, hand, or discard pile
  const inDeck = target.deck.includes(card_id);
  const inHand = target.hand.includes(card_id);
  const inDiscard = target.discard.includes(card_id);
  if (!inDeck && !inHand && !inDiscard) {
    return new Response(JSON.stringify({ error: 'Card not in target deck' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check card protection rules
  const { data: cardDef } = await supabase
    .from('card_definitions').select('rarity, is_starter').eq('id', card_id).single();
  if (!cardDef) {
    return new Response(JSON.stringify({ error: 'Card not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }
  if (cardDef.is_starter) {
    return new Response(JSON.stringify({ error: 'Starter cards are protected' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }
  if (cardDef.rarity === 'legendary') {
    return new Response(JSON.stringify({ error: 'Legendary cards are protected' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }
  if (cardDef.rarity === 'epic') {
    const isProtected = Math.random() < 0.5;
    if (isProtected) {
      return new Response(JSON.stringify({ error: 'Epic card was protected this time' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Add card to salvager's collection (increment quantity correctly)
  const { data: existing } = await supabase
    .from('user_collections')
    .select('quantity')
    .eq('user_id', user.id)
    .eq('card_id', card_id)
    .maybeSingle();

  if (existing) {
    const { error: collUpdateErr } = await supabase.from('user_collections')
      .update({ quantity: existing.quantity + 1 })
      .eq('user_id', user.id)
      .eq('card_id', card_id);
    if (collUpdateErr) {
      return new Response(JSON.stringify({ error: 'Failed to update collection' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }
  } else {
    const { error: collInsertErr } = await supabase.from('user_collections')
      .insert({ user_id: user.id, card_id, quantity: 1 });
    if (collInsertErr) {
      return new Response(JSON.stringify({ error: 'Failed to update collection' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Issue 2: Remove card from target's deck/hand/discard to make the operation idempotent
  if (inDeck) target.deck.splice(target.deck.indexOf(card_id), 1);
  if (inHand) target.hand.splice(target.hand.indexOf(card_id), 1);
  if (inDiscard) target.discard.splice(target.discard.indexOf(card_id), 1);

  // Log to game state
  state.log.push(`${user.id} salvaged ${card_id} from ${target_user_id}`);
  const { error: gsUpdateErr } = await supabase.from('game_state')
    .update({ state, updated_at: new Date().toISOString() })
    .eq('room_id', room_id);
  if (gsUpdateErr) {
    return new Response(JSON.stringify({ error: 'Failed to save game state' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
