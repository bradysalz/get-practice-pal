"use client";

import { useState, useTransition } from "react";
import { searchBookMetadataAction } from "@/app/(app)/library/actions";
import type { GoogleBooksCandidate } from "@/lib/data/google-books";

type BookMetadataSearchProps = {
  author?: string | null;
  title?: string | null;
};

export function BookMetadataSearch({ author, title }: BookMetadataSearchProps) {
  const [isbn, setIsbn] = useState("");
  const [searchTitle, setSearchTitle] = useState(title ?? "");
  const [searchAuthor, setSearchAuthor] = useState(author ?? "");
  const [results, setResults] = useState<GoogleBooksCandidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runSearch() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("isbn", isbn);
      formData.set("title", searchTitle);
      formData.set("author", searchAuthor);

      try {
        const nextResults = await searchBookMetadataAction(formData);
        setResults(nextResults);
      } catch (nextError) {
        setResults(null);
        setError(nextError instanceof Error ? nextError.message : "Book metadata lookup failed.");
      }
    });
  }

  return (
    <div className="rounded-box border border-base-300 bg-base-100/70 p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(8rem,0.8fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_auto] md:items-end">
        <label className="form-control w-full">
          <span className="label-text mb-2 text-sm font-medium text-base-content">ISBN</span>
          <input
            className="input w-full"
            inputMode="numeric"
            onChange={(event) => setIsbn(event.target.value)}
            placeholder="978..."
            value={isbn}
          />
        </label>
        <label className="form-control w-full">
          <span className="label-text mb-2 text-sm font-medium text-base-content">Title</span>
          <input
            className="input w-full"
            onChange={(event) => setSearchTitle(event.target.value)}
            placeholder="Stick Control"
            value={searchTitle}
          />
        </label>
        <label className="form-control w-full">
          <span className="label-text mb-2 text-sm font-medium text-base-content">Author</span>
          <input
            className="input w-full"
            onChange={(event) => setSearchAuthor(event.target.value)}
            placeholder="George Lawrence Stone"
            value={searchAuthor}
          />
        </label>
        <button type="button" className="btn btn-outline" disabled={isPending} onClick={runSearch}>
          {isPending ? "Searching..." : "Search"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}

      {results ? (
        <div className="mt-4 space-y-2">
          {results.length ? (
            results.slice(0, 3).map((result) => (
              <div
                key={result.providerBookId}
                className="rounded-box border border-base-300 bg-base-100 px-3 py-2"
              >
                <p className="font-medium text-base-content">{result.title}</p>
                <p className="mt-1 text-sm text-base-content/65">
                  {result.authors.length ? result.authors.join(", ") : "Unknown author"}
                  {result.publishedYear ? ` · ${result.publishedYear}` : ""}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-box border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content/65">
              No matching external books found.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
