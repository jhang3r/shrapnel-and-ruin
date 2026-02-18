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

  // Verify recipient owns all requested cards and none are starters (pre-flight check for user feedback)
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

  // Execute the trade atomically via database transaction
  const { data: result, error: execErr } = await supabase.rpc('execute_trade', {
    p_trade_id: trade_id,
    p_recipient_id: user.id
  });

  if (execErr) {
    return new Response(JSON.stringify({ error: 'Trade execution failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (result?.error) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
