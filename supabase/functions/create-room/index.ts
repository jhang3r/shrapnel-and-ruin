import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const { max_players = 4, deck_id } = await req.json();

  if (!Number.isInteger(max_players) || max_players < 2 || max_players > 4) {
    return new Response(JSON.stringify({ error: 'max_players must be 2–4' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Generate unique 6-char room code
  let room_code = '';
  let attempts = 0;
  let codeFound = false;
  while (attempts < 10) {
    room_code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data } = await supabase.from('game_rooms').select('id').eq('room_code', room_code).maybeSingle();
    if (!data) { codeFound = true; break; }
    attempts++;
  }
  if (!codeFound) {
    return new Response(JSON.stringify({ error: 'Failed to generate unique room code' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const { data: room, error } = await supabase
    .from('game_rooms')
    .insert({ room_code, max_players, host_id: user.id })
    .select('id, room_code')
    .single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  if (deck_id) {
    const { data: deck } = await supabase.from('decks').select('id').eq('id', deck_id).eq('user_id', user.id).maybeSingle();
    if (!deck) return new Response(JSON.stringify({ error: 'Invalid deck' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Add host as first player
  const { error: playerError } = await supabase.from('game_players').insert({
    room_id: room.id, user_id: user.id, deck_id, seat_order: 0
  });
  if (playerError) {
    // Cleanup the orphaned room
    await supabase.from('game_rooms').delete().eq('id', room.id);
    return new Response(JSON.stringify({ error: 'Failed to join room' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify(room), { headers: { 'Content-Type': 'application/json' } });
});
