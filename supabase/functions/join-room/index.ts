import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const { room_code, deck_id } = await req.json();

  const { data: room } = await supabase
    .from('game_rooms')
    .select('id, max_players, status')
    .eq('room_code', room_code.toUpperCase())
    .single();

  if (!room) return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  if (room.status !== 'pending') return new Response(JSON.stringify({ error: 'Game already started' }), { status: 409, headers: { 'Content-Type': 'application/json' } });

  const { count } = await supabase
    .from('game_players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', room.id);

  if ((count ?? 0) >= room.max_players) {
    return new Response(JSON.stringify({ error: 'Room is full' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
  }

  if (deck_id) {
    const { data: deck } = await supabase.from('decks').select('id').eq('id', deck_id).eq('user_id', user.id).maybeSingle();
    if (!deck) return new Response(JSON.stringify({ error: 'Invalid deck' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Note: race condition on seat_order is inherent to the non-transactional design.
  // A unique constraint violation at the DB level is caught here.
  const { error: upsertError } = await supabase.from('game_players').upsert(
    { room_id: room.id, user_id: user.id, deck_id, seat_order: count ?? 0 },
    { onConflict: 'room_id,user_id' }
  );
  if (upsertError) {
    return new Response(JSON.stringify({ error: 'Failed to join room' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ room_id: room.id }), { headers: { 'Content-Type': 'application/json' } });
});
