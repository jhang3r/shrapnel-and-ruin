import { createClient } from '@supabase/supabase-js';
import { buildPlayerState, applyUpkeep, advanceTurn } from '../../supabase/functions/_shared/game-engine';
import { resolveDamage, rollDice } from '../../supabase/functions/_shared/damage';
import { aiChooseAction } from './ai-player';
import type { GameState } from '../../supabase/functions/_shared/types';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function runSimulation(deckIds: string[], numGames = 100): Promise<void> {
  const { data: cardDefs } = await supabase.from('card_definitions').select('*');
  const cardDefMap = Object.fromEntries((cardDefs ?? []).map((c: any) => [c.id, c]));

  const stats: Record<string, { wins: number; games: number }> = {};

  for (let g = 0; g < numGames; g++) {
    let state: GameState = {
      players: {},
      turn_order: [],
      phase: 'upkeep',
      turn_number: 1,
      active_player_id: '',
      log: []
    };
    const playerIds = deckIds.map((_, i) => `ai-${i}`);

    for (let i = 0; i < deckIds.length; i++) {
      const { data: deckCards } = await supabase
        .from('deck_cards')
        .select('card_id, quantity, card_definitions(stats, type)')
        .eq('deck_id', deckIds[i]);

      const deckCardIds: string[] = [];
      let frameCard: any = null;
      for (const dc of deckCards ?? []) {
        if ((dc.card_definitions as any).type === 'frame' && !frameCard) {
          frameCard = { id: dc.card_id, stats: (dc.card_definitions as any).stats };
        } else {
          for (let j = 0; j < dc.quantity; j++) deckCardIds.push(dc.card_id);
        }
      }
      if (!frameCard) continue;
      state.players[playerIds[i]] = buildPlayerState(playerIds[i], frameCard, deckCardIds);
      state.turn_order.push(playerIds[i]);
    }

    if (state.turn_order.length === 0) continue;
    state.active_player_id = state.turn_order[0];
    state = applyUpkeep(state);

    let turnCount = 0;
    while (turnCount < 200) {
      const living = state.turn_order.filter(uid => !state.players[uid].is_eliminated);
      if (living.length <= 1) break;

      const action = aiChooseAction(state, state.active_player_id, 'normal', cardDefMap);
      if (!action) {
        if (state.phase === 'build') {
          state.phase = 'combat';
        } else {
          state = advanceTurn(state);
          state = applyUpkeep(state);
          turnCount++;
        }
        continue;
      }

      if (action.action === 'attack') {
        const attacker = state.players[state.active_player_id];
        attacker.ap -= 1;
        const { weapon_card_id, target_user_id, target_part } = action.params;
        const weaponStats = cardDefMap[weapon_card_id]?.stats;
        if (weaponStats) {
          const damage = rollDice(weaponStats.damage);
          const result = resolveDamage(
            state.players[target_user_id],
            damage,
            target_part,
            weaponStats.energy_type ?? 'kinetic'
          );
          state.players[target_user_id] = result.targetState;
        }
      }
    }

    const winner = state.turn_order.find(uid => !state.players[uid].is_eliminated);
    for (const uid of state.turn_order) {
      if (!stats[uid]) stats[uid] = { wins: 0, games: 0 };
      stats[uid].games++;
      if (uid === winner) stats[uid].wins++;
    }
  }

  console.log('\n=== Balancer Results ===');
  for (const [uid, s] of Object.entries(stats)) {
    console.log(`${uid}: ${s.wins}/${s.games} wins (${((s.wins / s.games) * 100).toFixed(1)}%)`);
  }
}

const deckIds = process.argv.slice(2);
if (deckIds.length < 2) {
  console.error('Pass at least 2 deck IDs');
  process.exit(1);
}
runSimulation(deckIds, 100).catch(console.error);
