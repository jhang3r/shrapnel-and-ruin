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

  const { recipient_id, offered_card_ids, requested_card_ids } = await req.json();

  // Input validation
  if (!recipient_id || !Array.isArray(offered_card_ids) || offered_card_ids.length === 0 || !Array.isArray(requested_card_ids) || requested_card_ids.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid trade request' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (recipient_id === user.id) {
    return new Response(JSON.stringify({ error: 'Cannot trade with yourself' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Verify recipient exists
  const { data: recipientProfile } = await supabase
    .from('profiles').select('id').eq('id', recipient_id).maybeSingle();
  if (!recipientProfile) {
    return new Response(JSON.stringify({ error: 'Recipient not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Verify initiator owns all offered cards (and none are starter cards)
  for (const cardId of offered_card_ids) {
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

  const { data: trade, error } = await supabase.from('trades').insert({
    initiator_id: user.id,
    recipient_id,
    offered_card_ids,
    requested_card_ids,
    status: 'pending'
  }).select('id').single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ trade_id: trade?.id }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
