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
    // Check if row exists first, then increment or insert
    const { data: existing, error: selectErr } = await supabase
      .from('user_collections')
      .select('quantity')
      .eq('user_id', p.userId)
      .eq('card_id', cardId)
      .maybeSingle();

    if (selectErr) {
      console.error(`Failed to check collection for ${p.userId}:`, selectErr.message);
      continue;
    }

    if (existing) {
      const { error: updateErr } = await supabase
        .from('user_collections')
        .update({ quantity: existing.quantity + 1 })
        .eq('user_id', p.userId)
        .eq('card_id', cardId);
      if (updateErr) console.error(`Failed to update reward for ${p.userId}:`, updateErr.message);
    } else {
      const { error: insertErr } = await supabase
        .from('user_collections')
        .insert({ user_id: p.userId, card_id: cardId, quantity: 1 });
      if (insertErr) console.error(`Failed to insert reward for ${p.userId}:`, insertErr.message);
    }
  }
}
