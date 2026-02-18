import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { room_code, deck_id } = await req.json();

  const { data: room } = await supabase
    .from('game_rooms')
    .select('id, max_players, status')
    .eq('room_code', room_code.toUpperCase())
    .single();

  if (!room) return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
  if (room.status !== 'pending') return new Response(JSON.stringify({ error: 'Game already started' }), { status: 409 });

  const { count } = await supabase
    .from('game_players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', room.id);

  if ((count ?? 0) >= room.max_players) {
    return new Response(JSON.stringify({ error: 'Room is full' }), { status: 409 });
  }

  await supabase.from('game_players').upsert(
    { room_id: room.id, user_id: user.id, deck_id, seat_order: count },
    { onConflict: 'room_id,user_id' }
  );

  return new Response(JSON.stringify({ room_id: room.id }), { headers: { 'Content-Type': 'application/json' } });
});
