"use client";

import { useRef, useState } from "react";
import {
  saveBookMetadataSelectionAction,
  searchBookMetadataAction,
} from "@/app/(app)/library/actions";
import type { ExternalBookSelection } from "@/lib/data/external-books";
import type { GoogleBooksCandidate } from "@/lib/data/google-books";

export type LinkedExternalBook = {
  id: string;
  title: string;
  authors?: string[] | null;
  published_year?: number | null;
  publishedYear?: number | null;
  isbn_10?: string | null;
  isbn_13?: string | null;
  cover_thumbnail_url?: string | null;
  cover_small_url?: string | null;
  cover_medium_url?: string | null;
  cover_large_url?: string | null;
  canonical_url?: string | null;
};

type BookMetadataSearchProps = {
  author?: string | null;
  initialExternalBook?: LinkedExternalBook | LinkedExternalBook[] | null;
  initialExternalBookId?: string | null;
  title?: string | null;
};

function externalBookFromSelection(book: ExternalBookSelection): LinkedExternalBook {
  return {
    id: book.id,
    title: book.title,
    authors: book.authors,
    publishedYear: book.publishedYear,
    isbn_10: book.isbn10,
    isbn_13: book.isbn13,
    cover_thumbnail_url: book.coverThumbnailUrl,
    cover_small_url: book.coverSmallUrl,
    cover_medium_url: book.coverMediumUrl,
    cover_large_url: book.coverLargeUrl,
    canonical_url: book.canonicalUrl,
  };
}

function coverUrl(book: LinkedExternalBook | GoogleBooksCandidate) {
  if ("coverLargeUrl" in book) {
    return book.coverLargeUrl ?? book.coverMediumUrl ?? book.coverSmallUrl ?? book.coverThumbnailUrl;
  }

  return (
    book.cover_large_url ??
    book.cover_medium_url ??
    book.cover_small_url ??
    book.cover_thumbnail_url ??
    null
  );
}

function publishedYear(book: LinkedExternalBook | GoogleBooksCandidate) {
  if ("publishedYear" in book) {
    return book.publishedYear ?? null;
  }

  return book.published_year ?? null;
}

function isbnLabel(book: LinkedExternalBook | GoogleBooksCandidate) {
  if ("isbn13" in book) {
    return book.isbn13 ?? book.isbn10 ?? null;
  }

  return book.isbn_13 ?? book.isbn_10 ?? null;
}

function authorsLabel(authors: string[] | null | undefined) {
  return authors?.length ? authors.join(", ") : "Unknown author";
}

export function BookMetadataSearch({
  author,
  initialExternalBook,
  initialExternalBookId,
  title,
}: BookMetadataSearchProps) {
  const resolvedInitialExternalBook = Array.isArray(initialExternalBook)
    ? (initialExternalBook[0] ?? null)
    : initialExternalBook;
  const rootRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<GoogleBooksCandidate[] | null>(null);
  const [selectedExternalBookId, setSelectedExternalBookId] = useState(
    initialExternalBookId ?? resolvedInitialExternalBook?.id ?? "",
  );
  const [selectedExternalBook, setSelectedExternalBook] = useState(resolvedInitialExternalBook ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectionPendingId, setSelectionPendingId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(!resolvedInitialExternalBook);

  function form() {
    return rootRef.current?.closest("form") ?? null;
  }

  function formValue(name: string) {
    const currentForm = form();
    const field = currentForm?.elements.namedItem(name);
    return field instanceof HTMLInputElement ? field.value.trim() : "";
  }

  function setFormValue(name: string, value: string) {
    const currentForm = form();
    const field = currentForm?.elements.namedItem(name);

    if (field instanceof HTMLInputElement) {
      field.value = value;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  async function runSearch() {
    setError(null);
    setIsSearching(true);

    const formData = new FormData();
    formData.set("title", formValue("title") || title || "");
    formData.set("author", formValue("composer") || author || "");

    try {
      const nextResults = await searchBookMetadataAction(formData);
      setResults(nextResults);
    } catch (nextError) {
      setResults(null);
      setError(nextError instanceof Error ? nextError.message : "Book metadata lookup failed.");
    } finally {
      setIsSearching(false);
    }
  }

  async function selectResult(result: GoogleBooksCandidate) {
    setError(null);
    setSelectionPendingId(result.providerBookId);

    try {
      const externalBook = await saveBookMetadataSelectionAction(result);
      setFormValue("title", result.title);
      setFormValue("composer", result.authors[0] ?? "");
      setSelectedExternalBookId(externalBook.id);
      setSelectedExternalBook(externalBookFromSelection(externalBook));
      setResults(null);
      setShowSearch(false);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Book metadata selection failed.");
    } finally {
      setSelectionPendingId(null);
    }
  }

  function skipLinking() {
    setSelectedExternalBookId("");
    setSelectedExternalBook(null);
    setShowSearch(true);
  }

  return (
    <div ref={rootRef} className="rounded-box border border-base-300 bg-base-100/70 p-4">
      <input type="hidden" name="externalBookId" value={selectedExternalBookId} />

      {selectedExternalBook ? (
        <div className="mb-4 flex flex-col gap-3 rounded-box border border-success/30 bg-success/10 p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            {coverUrl(selectedExternalBook) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="h-20 w-14 rounded object-cover"
                src={coverUrl(selectedExternalBook) ?? undefined}
              />
            ) : null}
            <div>
              <p className="text-sm font-bold text-base-content">Selected book</p>
              <p className="mt-1 font-medium text-base-content">{selectedExternalBook.title}</p>
              <p className="mt-1 text-sm text-base-content/80">
                {authorsLabel(selectedExternalBook.authors)}
                {publishedYear(selectedExternalBook) ? ` · ${publishedYear(selectedExternalBook)}` : ""}
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={skipLinking}>
            Remove link
          </button>
        </div>
      ) : null}

      {showSearch ? (
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-outline" disabled={isSearching} onClick={runSearch}>
            {isSearching ? "Searching..." : "Search Google Books"}
          </button>
          {selectedExternalBookId ? (
            <button type="button" className="btn btn-ghost" onClick={() => setShowSearch(false)}>
              Cancel
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}

      {showSearch && results ? (
        <div className="mt-4 space-y-2">
          {results.length ? (
            results.slice(0, 3).map((result) => (
              <div
                key={result.providerBookId}
                className="rounded-box border border-base-300 bg-base-100 p-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-3">
                    {coverUrl(result) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt=""
                        className="h-24 w-16 rounded object-cover"
                        src={coverUrl(result) ?? undefined}
                      />
                    ) : null}
                    <div>
                      <p className="font-medium text-base-content">{result.title}</p>
                      <p className="mt-1 text-sm text-base-content/80">
                        {authorsLabel(result.authors)}
                        {publishedYear(result) ? ` · ${publishedYear(result)}` : ""}
                      </p>
                      {isbnLabel(result) ? (
                        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-base-content/70">
                          ISBN {isbnLabel(result)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={Boolean(selectionPendingId)}
                    onClick={() => selectResult(result)}
                  >
                    {selectionPendingId === result.providerBookId ? "Linking..." : "Use this"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-box border border-base-300 bg-base-100 px-3 py-3 text-sm text-base-content/80">
              <p>No matching external books found.</p>
              <button type="button" className="btn btn-ghost btn-xs mt-2" onClick={skipLinking}>
                Continue without external metadata
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
