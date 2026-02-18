import type { GameState, PlayerState } from '../../supabase/functions/_shared/types';

export type Difficulty = 'easy' | 'normal' | 'hard';

export function aiChooseAction(
  state: GameState,
  userId: string,
  difficulty: Difficulty,
  cardDefs: Record<string, any>
): { action: string; params: Record<string, any> } | null {
  const player = state.players[userId];
  if (!player || player.is_eliminated || player.ap < 1) return null;

  const phase = state.phase;

  if (phase === 'build') {
    const energyCard = player.hand.find(id => cardDefs[id]?.type === 'energy');
    if (energyCard) return { action: 'play-card', params: { card_id: energyCard } };

    const componentCard = player.hand.find(id => cardDefs[id]?.type === 'component');
    if (componentCard) {
      const stats = cardDefs[componentCard]?.stats;
      const installPart = stats?.part_restriction?.[0] ?? 'torso';
      return { action: 'play-card', params: { card_id: componentCard, install_part: installPart } };
    }

    return null;
  }

  if (phase === 'combat') {
    const weapons = Object.values(player.parts)
      .flatMap(p => p.installed_components)
      .filter(c => c.is_active && cardDefs[c.card_id]?.stats?.slot_type === 'weapon');

    if (weapons.length === 0 || player.ap < 1) return null;

    const enemies = state.turn_order.filter(
      uid => uid !== userId && !state.players[uid].is_eliminated
    );
    if (enemies.length === 0) return null;

    const targetUserId = enemies[0];
    const targetPart = difficulty === 'hard' ? 'torso' : 'head';

    return {
      action: 'attack',
      params: { weapon_card_id: weapons[0].card_id, target_user_id: targetUserId, target_part: targetPart }
    };
  }

  return null;
}
