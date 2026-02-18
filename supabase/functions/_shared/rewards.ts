export const PACK_REWARDS: Record<string, { winner: string; loser: string }> = {
  pvp: { winner: 'elite', loser: 'standard' },
  ai: { winner: 'advanced', loser: 'standard' }
};

export async function grantMatchRewards(
  supabase: any,
  players: { userId: string; placement: number; isAi: boolean }[],
  isVsAi: boolean
): Promise<void> {
  for (const p of players) {
    if (p.isAi) continue;
    const tier = isVsAi
      ? (p.placement === 1 ? PACK_REWARDS.ai.winner : PACK_REWARDS.ai.loser)
      : (p.placement === 1 ? PACK_REWARDS.pvp.winner : PACK_REWARDS.pvp.loser);

    const cardId = `PACK_TOKEN_${tier.toUpperCase()}`;
    const { error: rpcErr } = await supabase.rpc('increment_card', {
      p_user_id: p.userId,
      p_card_id: cardId,
      p_amount: 1
    });
    if (rpcErr) console.error(`Failed to grant reward for ${p.userId}:`, rpcErr.message);
  }
}
