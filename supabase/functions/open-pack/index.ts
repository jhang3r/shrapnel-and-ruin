import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CARDS_PER_PACK = 5;
const PACK_COST = 100; // scrap cost per pack

function weightedRandom(weights: { rarity: string; weight: number }[]): string {
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * total;
  for (const { rarity, weight } of weights) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return weights[weights.length - 1].rarity;
}

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const { pack_id } = await req.json();

  // Fetch pack definition for rarity weights
  const { data: pack } = await supabase.from('packs').select('*').eq('id', pack_id).single();
  if (!pack) return new Response(JSON.stringify({ error: 'Pack not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  // Issue 3: Optimistic concurrency for scrap deduction to prevent race conditions.
  // Read current scrap balance.
  const { data: prof } = await supabase
    .from('profiles')
    .select('scrap')
    .eq('id', user.id)
    .single();

  if (!prof || prof.scrap < PACK_COST) {
    return new Response(JSON.stringify({ error: 'Not enough scrap to open a pack' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Conditional update: only succeeds if scrap hasn't changed since we read it.
  // If a concurrent request already deducted scrap, this update matches 0 rows and we return 409.
  const { data: updated, error: scrapErr } = await supabase
    .from('profiles')
    .update({ scrap: prof.scrap - PACK_COST })
    .eq('id', user.id)
    .eq('scrap', prof.scrap)  // optimistic concurrency check
    .select('id');

  if (scrapErr) {
    return new Response(JSON.stringify({ error: scrapErr.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  if (!updated || updated.length === 0) {
    return new Response(JSON.stringify({ error: 'Concurrent update conflict, please retry' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
  }

  // Pre-fetch all cards grouped by rarity (Problem D fix — batch instead of N+1)
  const { data: allCards } = await supabase.from('card_definitions').select('id, rarity');
  const byRarity: Record<string, string[]> = {};
  for (const c of allCards ?? []) {
    if (!byRarity[c.rarity]) byRarity[c.rarity] = [];
    byRarity[c.rarity].push(c.id);
  }

  // Pull cards using weighted random
  const pulled: string[] = [];
  for (let i = 0; i < CARDS_PER_PACK; i++) {
    const rarity = weightedRandom(pack.rarity_weights);
    const pool = byRarity[rarity] ?? [];
    if (pool.length > 0) {
      pulled.push(pool[Math.floor(Math.random() * pool.length)]);
    }
  }

  if (pulled.length === 0) {
    return new Response(JSON.stringify({ error: 'No cards available' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // Add pulled cards to user_collections; refund scrap and return 500 if any write fails.
  const grantedCards: string[] = [];
  for (const cardId of pulled) {
    const { data: existing } = await supabase.from('user_collections')
      .select('quantity').eq('user_id', user.id).eq('card_id', cardId).maybeSingle();

    let writeErr;
    if (existing) {
      const { error } = await supabase.from('user_collections')
        .update({ quantity: existing.quantity + 1 })
        .eq('user_id', user.id).eq('card_id', cardId);
      writeErr = error;
    } else {
      const { error } = await supabase.from('user_collections')
        .insert({ user_id: user.id, card_id: cardId, quantity: 1 });
      writeErr = error;
    }

    if (writeErr) {
      // Refund scrap for cards not yet granted
      const refundAmount = PACK_COST; // full refund - simpler than partial
      const { data: currentProf } = await supabase.from('profiles').select('scrap').eq('id', user.id).single();
      if (currentProf) {
        await supabase.from('profiles').update({ scrap: currentProf.scrap + refundAmount }).eq('id', user.id);
      }
      return new Response(JSON.stringify({ error: 'Failed to add cards to collection' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }
    grantedCards.push(cardId);
  }

  return new Response(JSON.stringify({ cards: grantedCards }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
