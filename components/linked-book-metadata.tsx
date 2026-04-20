import type { LinkedExternalBook } from "@/components/book-metadata-search";

type LinkedExternalBookInput = LinkedExternalBook | LinkedExternalBook[] | null | undefined;

export function resolveLinkedBook(book: LinkedExternalBookInput) {
  return Array.isArray(book) ? (book[0] ?? null) : book;
}

export function linkedBookPublishedYear(book: LinkedExternalBookInput) {
  const resolvedBook = resolveLinkedBook(book);
  return resolvedBook?.published_year ?? resolvedBook?.publishedYear ?? null;
}

export function linkedBookCoverUrl(book: LinkedExternalBookInput) {
  const resolvedBook = resolveLinkedBook(book);

  return (
    resolvedBook?.cover_large_url ??
    resolvedBook?.cover_medium_url ??
    resolvedBook?.cover_small_url ??
    resolvedBook?.cover_thumbnail_url ??
    null
  );
}

export function linkedBookAuthors(book: LinkedExternalBookInput) {
  const resolvedBook = resolveLinkedBook(book);
  return resolvedBook?.authors?.length ? resolvedBook.authors.join(", ") : null;
}

export function LinkedBookMetadata({
  book,
  compact = false,
}: {
  book: LinkedExternalBookInput;
  compact?: boolean;
}) {
  const resolvedBook = resolveLinkedBook(book);

  if (!resolvedBook) {
    return null;
  }

  const coverUrl = linkedBookCoverUrl(resolvedBook);
  const authors = linkedBookAuthors(resolvedBook);

  return (
    <div className="flex gap-3">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className={compact ? "h-20 w-14 rounded object-cover" : "h-28 w-20 rounded object-cover"}
          src={coverUrl}
        />
      ) : null}
      <div>
        <p className="font-medium text-base-content">{resolvedBook.title}</p>
        <p className="mt-1 text-sm text-base-content/80">
          {authors ?? "Unknown author"}
          {resolvedBook.published_year ? ` · ${resolvedBook.published_year}` : ""}
        </p>
        {resolvedBook.isbn_13 ?? resolvedBook.isbn_10 ? (
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-base-content/70">
            ISBN {resolvedBook.isbn_13 ?? resolvedBook.isbn_10}
          </p>
        ) : null}
      </div>
    </div>
  );
}
