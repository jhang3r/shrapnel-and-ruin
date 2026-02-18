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

  // Fetch profile for scrap balance
  const { data: prof } = await supabase
    .from('profiles')
    .select('scrap')
    .eq('id', user.id)
    .single();

  if (!prof || prof.scrap < PACK_COST) {
    return new Response(JSON.stringify({ error: 'Not enough scrap to open a pack' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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

  // Deduct scrap cost
  const { error: scrapErr } = await supabase
    .from('profiles')
    .update({ scrap: prof.scrap - PACK_COST })
    .eq('id', user.id);
  if (scrapErr) return new Response(JSON.stringify({ error: scrapErr.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  // Add pulled cards to user_collections using fetch-then-update (Problem B fix)
  for (const cardId of pulled) {
    const { data: existing } = await supabase
      .from('user_collections')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('card_id', cardId)
      .maybeSingle();
    if (existing) {
      await supabase
        .from('user_collections')
        .update({ quantity: existing.quantity + 1 })
        .eq('user_id', user.id)
        .eq('card_id', cardId);
    } else {
      await supabase
        .from('user_collections')
        .insert({ user_id: user.id, card_id: cardId, quantity: 1 });
    }
  }

  return new Response(JSON.stringify({ cards: pulled }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
