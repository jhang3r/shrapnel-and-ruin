import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Scrap value by rarity
const SCRAP_VALUES: Record<string, number> = {
  common: 5,
  uncommon: 15,
  rare: 40,
  epic: 100,
  legendary: 250,
};

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const { card_id, quantity } = await req.json();
  const qty: number = Math.max(1, Math.floor(quantity ?? 1));

  // Fetch card definition to get rarity
  const { data: cardDef } = await supabase
    .from('card_definitions')
    .select('id, rarity')
    .eq('id', card_id)
    .single();
  if (!cardDef) return new Response(JSON.stringify({ error: 'Card not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  // Fetch current collection entry
  const { data: collEntry } = await supabase
    .from('user_collections')
    .select('quantity')
    .eq('user_id', user.id)
    .eq('card_id', card_id)
    .maybeSingle();

  if (!collEntry || collEntry.quantity < qty) {
    return new Response(JSON.stringify({ error: 'Not enough cards to salvage' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const newQty = collEntry.quantity - qty;
  if (newQty === 0) {
    const { error: delErr } = await supabase
      .from('user_collections')
      .delete()
      .eq('user_id', user.id)
      .eq('card_id', card_id);
    if (delErr) return new Response(JSON.stringify({ error: delErr.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  } else {
    const { error: updErr } = await supabase
      .from('user_collections')
      .update({ quantity: newQty })
      .eq('user_id', user.id)
      .eq('card_id', card_id);
    if (updErr) return new Response(JSON.stringify({ error: updErr.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // Calculate scrap gain
  const scrapPerCard = SCRAP_VALUES[cardDef.rarity] ?? 5;
  const scrapGain = scrapPerCard * qty;

  // Fetch current scrap and increment
  const { data: prof } = await supabase
    .from('profiles')
    .select('scrap')
    .eq('id', user.id)
    .single();
  const newScrap = (prof?.scrap ?? 0) + scrapGain;
  const { error: scrapErr } = await supabase
    .from('profiles')
    .update({ scrap: newScrap })
    .eq('id', user.id);
  if (scrapErr) return new Response(JSON.stringify({ error: scrapErr.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  return new Response(JSON.stringify({ ok: true, scrap_gained: scrapGain, new_scrap_total: newScrap }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
