create extension if not exists pgcrypto;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  composer text,
  default_goal_tempo integer check (default_goal_tempo is null or default_goal_tempo > 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.book_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  default_goal_tempo integer check (default_goal_tempo is null or default_goal_tempo > 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_id uuid not null references public.book_sections(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  goal_tempo integer check (goal_tempo is null or goal_tempo > 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  goal_tempo integer check (goal_tempo is null or goal_tempo > 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.setlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.setlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  item_type text not null check (item_type in ('exercise', 'song')),
  exercise_id uuid references public.exercises(id) on delete cascade,
  song_id uuid references public.songs(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint setlist_items_item_reference_check check (
    (item_type = 'exercise' and exercise_id is not null and song_id is null) or
    (item_type = 'song' and song_id is not null and exercise_id is null)
  )
);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_setlist_id uuid references public.setlists(id) on delete set null,
  started_at timestamptz not null default timezone('utc'::text, now()),
  ended_at timestamptz,
  paused_at timestamptz,
  is_paused boolean not null default false,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create unique index if not exists practice_sessions_one_open_session_per_user
  on public.practice_sessions (user_id)
  where ended_at is null;

create table if not exists public.practice_session_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  practice_session_id uuid not null references public.practice_sessions(id) on delete cascade,
  item_type text not null check (item_type in ('exercise', 'song')),
  exercise_id uuid references public.exercises(id) on delete cascade,
  song_id uuid references public.songs(id) on delete cascade,
  tempo integer not null check (tempo > 0),
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint practice_session_items_item_reference_check check (
    (item_type = 'exercise' and exercise_id is not null and song_id is null) or
    (item_type = 'song' and song_id is not null and exercise_id is null)
  )
);

create unique index if not exists practice_session_items_unique_item_per_session
  on public.practice_session_items (
    practice_session_id,
    item_type,
    coalesce(exercise_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(song_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index if not exists books_user_id_idx on public.books (user_id);
create index if not exists book_sections_user_id_idx on public.book_sections (user_id);
create index if not exists exercises_user_id_idx on public.exercises (user_id);
create index if not exists artists_user_id_idx on public.artists (user_id);
create index if not exists songs_user_id_idx on public.songs (user_id);
create index if not exists setlists_user_id_idx on public.setlists (user_id);
create index if not exists setlist_items_user_id_idx on public.setlist_items (user_id);
create index if not exists practice_sessions_user_id_idx on public.practice_sessions (user_id);
create index if not exists practice_session_items_user_id_idx on public.practice_session_items (user_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger books_set_updated_at
before update on public.books
for each row execute function public.set_updated_at();

create trigger book_sections_set_updated_at
before update on public.book_sections
for each row execute function public.set_updated_at();

create trigger exercises_set_updated_at
before update on public.exercises
for each row execute function public.set_updated_at();

create trigger artists_set_updated_at
before update on public.artists
for each row execute function public.set_updated_at();

create trigger songs_set_updated_at
before update on public.songs
for each row execute function public.set_updated_at();

create trigger setlists_set_updated_at
before update on public.setlists
for each row execute function public.set_updated_at();

create trigger setlist_items_set_updated_at
before update on public.setlist_items
for each row execute function public.set_updated_at();

create trigger practice_sessions_set_updated_at
before update on public.practice_sessions
for each row execute function public.set_updated_at();

create trigger practice_session_items_set_updated_at
before update on public.practice_session_items
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.book_sections enable row level security;
alter table public.exercises enable row level security;
alter table public.artists enable row level security;
alter table public.songs enable row level security;
alter table public.setlists enable row level security;
alter table public.setlist_items enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_session_items enable row level security;

create policy "profiles are user scoped"
on public.profiles
for all
using (id = auth.uid())
with check (id = auth.uid());

create policy "books are user scoped"
on public.books
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "book_sections are user scoped"
on public.book_sections
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "exercises are user scoped"
on public.exercises
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "artists are user scoped"
on public.artists
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "songs are user scoped"
on public.songs
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "setlists are user scoped"
on public.setlists
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "setlist_items are user scoped"
on public.setlist_items
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "practice_sessions are user scoped"
on public.practice_sessions
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "practice_session_items are user scoped"
on public.practice_session_items
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
