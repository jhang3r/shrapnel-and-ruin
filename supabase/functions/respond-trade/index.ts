import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

  const { trade_id, accept } = await req.json();

  // Load trade — recipient_id filter ensures only the recipient can respond
  const { data: trade } = await supabase.from('trades')
    .select('*')
    .eq('id', trade_id)
    .eq('recipient_id', user.id)
    .eq('status', 'pending')
    .single();

  if (!trade) {
    return new Response(JSON.stringify({ error: 'Trade not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!accept) {
    await supabase.from('trades').update({ status: 'rejected' }).eq('id', trade_id);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Verify recipient owns all requested cards (and none are starter cards)
  for (const cardId of trade.requested_card_ids) {
    const { data } = await supabase.from('user_collections')
      .select('quantity, card_definitions(is_starter)')
      .eq('user_id', user.id).eq('card_id', cardId).single();
    if (!data || data.quantity < 1) {
      return new Response(JSON.stringify({ error: `You don't own ${cardId}` }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    if ((data.card_definitions as any)?.is_starter) {
      return new Response(JSON.stringify({ error: 'Starter cards cannot be traded' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Perform card transfers
  const transfers = [
    ...trade.offered_card_ids.map((id: string) => ({ from: trade.initiator_id, to: user.id, card_id: id })),
    ...trade.requested_card_ids.map((id: string) => ({ from: user.id, to: trade.initiator_id, card_id: id }))
  ];

  for (const t of transfers) {
    // Decrement from sender using the Postgres RPC function
    const { error: decrErr } = await supabase.rpc('decrement_card', {
      p_user_id: t.from,
      p_card_id: t.card_id
    });
    if (decrErr) {
      return new Response(JSON.stringify({ error: `Failed to transfer ${t.card_id}` }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add to receiver (increment correctly)
    const { data: existing } = await supabase.from('user_collections')
      .select('quantity').eq('user_id', t.to).eq('card_id', t.card_id).maybeSingle();

    if (existing) {
      const { error: updErr } = await supabase.from('user_collections')
        .update({ quantity: existing.quantity + 1 })
        .eq('user_id', t.to).eq('card_id', t.card_id);
      if (updErr) {
        return new Response(JSON.stringify({ error: `Failed to grant ${t.card_id}` }), {
          status: 500, headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      const { error: insErr } = await supabase.from('user_collections')
        .insert({ user_id: t.to, card_id: t.card_id, quantity: 1 });
      if (insErr) {
        return new Response(JSON.stringify({ error: `Failed to grant ${t.card_id}` }), {
          status: 500, headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }

  await supabase.from('trades').update({ status: 'accepted' }).eq('id', trade_id);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
