"use client";

import { useMemo, useState } from "react";
import {
  linkedBookAuthors,
  linkedBookCoverUrl,
  linkedBookPublishedYear,
  resolveLinkedBook,
} from "@/components/linked-book-metadata";
import { CardLink } from "@/components/ui/primitives";
import type { LibrarySnapshot } from "@/lib/data/library";

type BookSortMode = "recent" | "title";
type ArtistSortMode = "recent" | "name";

type BookItem = LibrarySnapshot["books"][number];
type ArtistItem = LibrarySnapshot["artists"][number];

function sortToggleClass(isActive: boolean) {
  return isActive ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm";
}

function compareStrings(left: string, right: string) {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function compareNewestFirst(left: string, right: string) {
  return new Date(right).getTime() - new Date(left).getTime();
}

export function BookOverviewGrid({ books }: { books: BookItem[] }) {
  const [sortMode, setSortMode] = useState<BookSortMode>("recent");
  const sortedBooks = useMemo(() => {
    const next = books.slice();

    next.sort((left, right) => {
      if (sortMode === "recent") {
        const updatedAtDiff = compareNewestFirst(left.updated_at, right.updated_at);
        return updatedAtDiff || compareStrings(left.title, right.title);
      }

      return compareStrings(left.title, right.title);
    });

    return next;
  }, [books, sortMode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/60">Sort</span>
        <button type="button" className={sortToggleClass(sortMode === "recent")} onClick={() => setSortMode("recent")}>
          Most recent
        </button>
        <button type="button" className={sortToggleClass(sortMode === "title")} onClick={() => setSortMode("title")}>
          Title
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedBooks.map((book) => {
          const sectionCount = book.sections?.length ?? 0;
          const bookExerciseCount = (book.sections ?? []).reduce(
            (sum, section) => sum + (section.exercises?.length ?? 0),
            0,
          );
          const externalBook = resolveLinkedBook(book.external_book);
          const coverUrl = linkedBookCoverUrl(externalBook);
          const displayTitle = externalBook?.title ?? book.title;
          const displayAuthor = linkedBookAuthors(externalBook) ?? book.composer;
          const publishedYear = linkedBookPublishedYear(externalBook);

          return (
            <CardLink key={book.id} href={`/library/books/${book.id}`} className="h-full">
              <div className="flex h-full gap-4">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className="h-24 w-16 shrink-0 rounded object-cover"
                    src={coverUrl}
                  />
                ) : null}
                <div className="flex min-w-0 flex-1 flex-col">
                  <h2 className="text-lg font-bold leading-tight text-base-content">{displayTitle}</h2>
                  <p className="mt-2 text-sm text-base-content/80">
                    {displayAuthor || "No composer set"}
                    {publishedYear ? ` · ${publishedYear}` : ""}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <span className="chip chip-neutral">
                      {sectionCount} section{sectionCount === 1 ? "" : "s"}
                    </span>
                    <span className="chip chip-neutral">
                      {bookExerciseCount} exercise{bookExerciseCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>
            </CardLink>
          );
        })}
      </div>
    </div>
  );
}

export function ArtistOverviewGrid({ artists }: { artists: ArtistItem[] }) {
  const [sortMode, setSortMode] = useState<ArtistSortMode>("recent");
  const sortedArtists = useMemo(() => {
    const next = artists.slice();

    next.sort((left, right) => {
      if (sortMode === "recent") {
        const updatedAtDiff = compareNewestFirst(left.updated_at, right.updated_at);
        return updatedAtDiff || compareStrings(left.name, right.name);
      }

      return compareStrings(left.name, right.name);
    });

    return next;
  }, [artists, sortMode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/60">Sort</span>
        <button type="button" className={sortToggleClass(sortMode === "recent")} onClick={() => setSortMode("recent")}>
          Most recent
        </button>
        <button type="button" className={sortToggleClass(sortMode === "name")} onClick={() => setSortMode("name")}>
          Name
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sortedArtists.map((artist) => {
          const artistSongCount = artist.songs?.length ?? 0;

          return (
            <CardLink key={artist.id} href={`/library/artists/${artist.id}`} className="h-full">
              <div className="flex h-full flex-col">
                <h2 className="text-lg font-bold leading-tight text-base-content">{artist.name}</h2>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <span className="chip chip-neutral">
                    {artistSongCount} song{artistSongCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </CardLink>
          );
        })}
      </div>
    </div>
  );
}
