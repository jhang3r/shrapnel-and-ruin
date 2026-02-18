import type { GameState, PlayerState, PartName, PartState } from './types.ts';

const PART_NAMES: PartName[] = ['head','torso','left_arm','right_arm','left_leg','right_leg'];
const INITIAL_HAND_SIZE = 5;

export function buildPlayerState(userId: string, frameCard: any, deckCardIds: string[]): PlayerState {
  const shuffled = [...deckCardIds].sort(() => Math.random() - 0.5);
  const hand = shuffled.splice(0, INITIAL_HAND_SIZE);

  const parts = {} as Record<PartName, PartState>;
  for (const part of PART_NAMES) {
    const hp = frameCard.stats.base_hp[part] ?? 20;
    parts[part] = { name: part, hp, max_hp: hp, armor: 0, installed_components: [], status_effects: [] };
  }

  return {
    user_id: userId,
    frame_card_id: frameCard.id,
    parts,
    shield: null,
    ap: frameCard.stats.base_ap,
    ap_per_turn: frameCard.stats.base_ap,
    hand,
    deck: shuffled,
    discard: [],
    reshuffle_count: 0,
    status_effects: [],
    is_eliminated: false,
    targeting_system: false
  };
}

export async function initGameState(supabase: any, roomId: string, players: any[]): Promise<GameState> {
  const gameState: GameState = {
    players: {},
    turn_order: [],
    phase: 'upkeep',
    turn_number: 1,
    active_player_id: '',  // set after player loop
    log: ['Game started!']
  };

  for (const player of players) {
    // Fetch their deck's card IDs
    const { data: deckCards, error: deckError } = await supabase
      .from('deck_cards')
      .select('card_id, quantity, card_definitions(stats, type)')
      .eq('deck_id', player.deck_id);

    if (deckError) {
      throw new Error(`Failed to load deck for player ${player.user_id}: ${deckError.message}`);
    }

    // Expand deck (quantity copies each)
    const deckCardIds: string[] = [];
    let frameCard: any = null;
    for (const dc of deckCards ?? []) {
      if ((dc.card_definitions as any).type === 'frame' && !frameCard) {
        frameCard = { id: dc.card_id, stats: (dc.card_definitions as any).stats };
        continue;  // Frame card defines the mech, not a draw pile card
      }
      for (let i = 0; i < dc.quantity; i++) deckCardIds.push(dc.card_id);
    }

    if (!frameCard) continue; // skip invalid decks
    gameState.players[player.user_id] = buildPlayerState(player.user_id, frameCard, deckCardIds);
    gameState.turn_order.push(player.user_id);
  }

  if (gameState.turn_order.length === 0) {
    throw new Error('No valid players with frame cards found');
  }
  gameState.active_player_id = gameState.turn_order[0];

  return gameState;
}

export function applyUpkeep(state: GameState): GameState {
  const s = structuredClone(state);
  const player = s.players[s.active_player_id];

  // Draw 2 cards
  for (let i = 0; i < 2; i++) {
    if (player.deck.length === 0) {
      player.deck = [...player.discard].sort(() => Math.random() - 0.5);
      player.discard = [];
      player.reshuffle_count += 1;
      // 5 damage per reshuffle
      const torso = player.parts.torso;
      torso.hp = Math.max(0, torso.hp - 5);
    }
    if (player.deck.length > 0) player.hand.push(player.deck.shift()!);
  }

  // Shield regen
  if (player.shield) {
    player.shield.sp = Math.min(player.shield.max_sp, player.shield.sp + player.shield.regen);
  }

  // Tick status effects down — capture burning BEFORE filtering
  const burnBeforeTick = player.status_effects.find(se => se.effect === 'burning' && se.turns_remaining > 0);
  player.status_effects = player.status_effects
    .map(se => ({ ...se, turns_remaining: se.turns_remaining - 1 }))
    .filter(se => se.turns_remaining > 0);

  // Burning damage — use pre-tick capture to include final tick
  if (burnBeforeTick) {
    const torso = player.parts.torso;
    torso.hp = Math.max(0, torso.hp - 3);
  }

  // Restore AP
  let apBonus = 0;
  const stunned = player.status_effects.find(se => se.effect === 'stunned');
  if (stunned) apBonus -= 1;
  player.ap = Math.max(0, player.ap_per_turn + apBonus);

  s.phase = 'build';
  s.log.push(`Upkeep: ${player.user_id} draws 2 cards, AP restored to ${player.ap}`);
  return s;
}

export function advanceTurn(state: GameState): GameState {
  const s = structuredClone(state);
  // Discard to 7
  const player = s.players[s.active_player_id];
  while (player.hand.length > 7) player.discard.push(player.hand.pop()!);

  // Next living player
  const living = s.turn_order.filter(uid => !s.players[uid].is_eliminated);
  const idx = living.indexOf(s.active_player_id);
  s.active_player_id = living[(idx + 1) % living.length];
  s.turn_number += 1;
  s.phase = 'upkeep';
  s.log.push(`Turn ${s.turn_number} — ${s.active_player_id}'s turn`);
  return s;
}
