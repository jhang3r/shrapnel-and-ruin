import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { max_players = 4, deck_id } = await req.json();

  // Generate unique 6-char room code
  let room_code = '';
  let attempts = 0;
  while (attempts < 10) {
    room_code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data } = await supabase.from('game_rooms').select('id').eq('room_code', room_code).maybeSingle();
    if (!data) break;
    attempts++;
  }

  const { data: room, error } = await supabase
    .from('game_rooms')
    .insert({ room_code, max_players, host_id: user.id })
    .select('id, room_code')
    .single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  // Add host as first player
  await supabase.from('game_players').insert({
    room_id: room.id, user_id: user.id, deck_id, seat_order: 0
  });

  return new Response(JSON.stringify(room), { headers: { 'Content-Type': 'application/json' } });
});
