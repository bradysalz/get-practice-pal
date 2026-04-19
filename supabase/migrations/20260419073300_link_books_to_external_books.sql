alter table public.books
  add column if not exists external_book_id uuid references public.external_books(id) on delete set null;

create index if not exists books_external_book_id_idx
  on public.books (external_book_id)
  where external_book_id is not null;
