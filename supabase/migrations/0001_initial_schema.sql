-- Extensions
create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  scrap integer not null default 0,
  is_guest boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Card definitions
create table public.card_definitions (
  id text primary key,
  name text not null,
  type text not null check (type in ('frame','component','action','energy','armor')),
  rarity text not null check (rarity in ('common','uncommon','rare','epic','legendary')),
  point_cost integer not null check (point_cost between 1 and 10),
  stats jsonb not null default '{}',
  discard_effect jsonb not null default '{}',
  image_url text,
  is_starter boolean not null default false,
  created_at timestamptz not null default now()
);

-- User collections
create table public.user_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id text not null references public.card_definitions(id),
  quantity integer not null default 1 check (quantity >= 1),
  is_starter boolean not null default false,
  unique(user_id, card_id)
);
alter table public.user_collections enable row level security;
create policy "Users can read own collection" on public.user_collections for select using (auth.uid() = user_id);

-- Decks
create table public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  is_starter boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.decks enable row level security;
create policy "Users can manage own decks" on public.decks for all using (auth.uid() = user_id);

-- Deck cards
create table public.deck_cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  card_id text not null references public.card_definitions(id),
  quantity integer not null default 1 check (quantity between 1 and 4),
  unique(deck_id, card_id)
);
alter table public.deck_cards enable row level security;
create policy "Users can manage cards in own decks" on public.deck_cards for all
  using (exists (select 1 from public.decks d where d.id = deck_id and d.user_id = auth.uid()));

-- Game rooms
create table public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code char(6) unique not null,
  status text not null default 'pending' check (status in ('pending','in_progress','completed')),
  max_players integer not null default 4 check (max_players between 2 and 4),
  host_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.game_rooms enable row level security;
create policy "Anyone can read rooms" on public.game_rooms for select using (true);

-- Game players
create table public.game_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  deck_id uuid references public.decks(id),
  is_ready boolean not null default false,
  seat_order integer,
  unique(room_id, user_id)
);
alter table public.game_players enable row level security;
create policy "Players in room can read game_players" on public.game_players for select
  using (
    exists (
      select 1 from public.game_players gp
      where gp.room_id = game_players.room_id
        and gp.user_id = auth.uid()
    )
  );

-- Game state
create table public.game_state (
  id uuid primary key default gen_random_uuid(),
  room_id uuid unique not null references public.game_rooms(id) on delete cascade,
  state jsonb not null default '{}',
  phase text not null default 'upkeep' check (phase in ('upkeep','build','combat','end')),
  turn_number integer not null default 1,
  active_player_id uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);
alter table public.game_state enable row level security;
create policy "Players in room can read game state" on public.game_state for select
  using (
    exists (
      select 1 from public.game_players gp
      where gp.room_id = game_state.room_id
        and gp.user_id = auth.uid()
    )
  );

-- Match history
create table public.match_history (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.game_rooms(id),
  winner_id uuid references public.profiles(id),
  duration_seconds integer,
  completed_at timestamptz not null default now()
);
alter table public.match_history enable row level security;
create policy "Authenticated users can read match history" on public.match_history for select
  using (auth.role() = 'authenticated');

-- Match players (per-player results)
create table public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.match_history(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  placement integer not null,
  salvaged_card_ids text[] not null default '{}'
);
alter table public.match_players enable row level security;
create policy "Users can read own match results" on public.match_players for select
  using (auth.uid() = user_id);

-- P2P Trades
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  initiator_id uuid not null references public.profiles(id),
  recipient_id uuid not null references public.profiles(id),
  offered_card_ids text[] not null,
  requested_card_ids text[] not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','cancelled')),
  created_at timestamptz not null default now()
);
alter table public.trades enable row level security;
create policy "Parties can read own trades" on public.trades for select
  using (auth.uid() = initiator_id or auth.uid() = recipient_id);
create policy "Initiator can create trade" on public.trades for insert
  with check (auth.uid() = initiator_id);
create policy "Parties can update trade status" on public.trades for update
  using (auth.uid() = initiator_id or auth.uid() = recipient_id);

-- Packs
create table public.packs (
  id text primary key,
  name text not null,
  rarity_weights jsonb not null
);

-- Performance indexes
create index on public.user_collections (user_id);
create index on public.decks (user_id);
create index on public.deck_cards (deck_id);
create index on public.game_players (room_id);
create index on public.game_players (user_id);
create index on public.trades (initiator_id);
create index on public.trades (recipient_id);
create index on public.match_players (user_id);
