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
