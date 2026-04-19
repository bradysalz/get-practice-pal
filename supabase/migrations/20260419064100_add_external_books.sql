create table if not exists public.external_books (
  id uuid primary key default gen_random_uuid(),
  created_by_user_id uuid references auth.users(id) on delete set null,
  provider text not null check (provider = btrim(provider) and provider <> ''),
  provider_book_id text not null check (provider_book_id = btrim(provider_book_id) and provider_book_id <> ''),
  isbn_10 text check (isbn_10 is null or isbn_10 = btrim(isbn_10)),
  isbn_13 text check (isbn_13 is null or isbn_13 = btrim(isbn_13)),
  title text not null check (title = btrim(title) and title <> ''),
  subtitle text check (subtitle is null or subtitle = btrim(subtitle)),
  authors text[] not null default '{}'::text[],
  published_year integer check (published_year is null or published_year between 0 and 3000),
  published_date text check (published_date is null or published_date = btrim(published_date)),
  description text,
  language text check (language is null or language = btrim(language)),
  page_count integer check (page_count is null or page_count > 0),
  cover_thumbnail_url text check (cover_thumbnail_url is null or cover_thumbnail_url = btrim(cover_thumbnail_url)),
  cover_small_url text check (cover_small_url is null or cover_small_url = btrim(cover_small_url)),
  cover_medium_url text check (cover_medium_url is null or cover_medium_url = btrim(cover_medium_url)),
  cover_large_url text check (cover_large_url is null or cover_large_url = btrim(cover_large_url)),
  canonical_url text check (canonical_url is null or canonical_url = btrim(canonical_url)),
  raw_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint external_books_provider_book_id_unique unique (provider, provider_book_id)
);

alter table public.external_books
  add column if not exists created_by_user_id uuid references auth.users(id) on delete set null;

create index if not exists external_books_created_by_user_id_idx
  on public.external_books (created_by_user_id)
  where created_by_user_id is not null;

create index if not exists external_books_isbn_10_idx
  on public.external_books (isbn_10)
  where isbn_10 is not null;

create index if not exists external_books_isbn_13_idx
  on public.external_books (isbn_13)
  where isbn_13 is not null;

create index if not exists external_books_title_idx
  on public.external_books (title);

drop trigger if exists external_books_set_updated_at on public.external_books;
create trigger external_books_set_updated_at
before update on public.external_books
for each row execute function public.set_updated_at();

alter table public.external_books enable row level security;

drop policy if exists "external_books are readable by authenticated users"
on public.external_books;

create policy "external_books are readable by authenticated users"
on public.external_books
for select
using (auth.role() = 'authenticated');

drop policy if exists "external_books can be inserted by authenticated users"
on public.external_books;

create policy "external_books can be inserted by authenticated users"
on public.external_books
for insert
with check (
  auth.role() = 'authenticated'
  and created_by_user_id = auth.uid()
);

drop policy if exists "external_books can be updated by authenticated users"
on public.external_books;

create policy "external_books can be updated by authenticated users"
on public.external_books
for update
using (
  auth.role() = 'authenticated'
  and created_by_user_id = auth.uid()
)
with check (
  auth.role() = 'authenticated'
  and created_by_user_id = auth.uid()
);
