-- Enable full replica identity for tables used with Supabase Realtime filtered subscriptions
alter table public.game_state replica identity full;
alter table public.game_players replica identity full;
