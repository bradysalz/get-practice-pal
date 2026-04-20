"use client";

import { useMemo, useState } from "react";
import { EmptyState, Field, TextInput } from "@/components/ui/primitives";
import type { LibrarySnapshot } from "@/lib/data/library";

type PracticeItemPickerProps = {
  inputName?: string;
  snapshot: Pick<LibrarySnapshot, "artists" | "books">;
};

type PickerView =
  | { type: "root" }
  | { type: "books" }
  | { type: "book"; bookId: string }
  | { type: "section"; bookId: string; sectionId: string }
  | { type: "artists" }
  | { type: "artist"; artistId: string };

type SelectionState = {
  keys: string[];
  scope: string | null;
};

type SearchScope = "all" | "artists" | "books";

type Book = LibrarySnapshot["books"][number];
type Section = NonNullable<Book["sections"]>[number];
type Exercise = NonNullable<Section["exercises"]>[number];
type Artist = LibrarySnapshot["artists"][number];
type Song = NonNullable<Artist["songs"]>[number];

const ROOT_VIEW: PickerView = { type: "root" };

export function PracticeItemPicker({
  inputName = "itemKey",
  snapshot,
}: PracticeItemPickerProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<PickerView>(ROOT_VIEW);
  const [selection, setSelection] = useState<SelectionState>({ keys: [], scope: null });

  const normalizedQuery = query.trim().toLowerCase();
  const selectedKeys = selection.keys;
  const books = useMemo(() => snapshot.books ?? [], [snapshot.books]);
  const artists = useMemo(() => snapshot.artists ?? [], [snapshot.artists]);

  const currentBook = view.type === "book" || view.type === "section"
    ? books.find((book) => book.id === view.bookId) ?? null
    : null;
  const currentSection = view.type === "section"
    ? currentBook?.sections?.find((section) => section.id === view.sectionId) ?? null
    : null;
  const currentArtist = view.type === "artist"
    ? artists.find((artist) => artist.id === view.artistId) ?? null
    : null;
  const searchScope = getSearchScope(view);

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return { artists: [], sections: [] };
    }

    const matches = (value: string | null | undefined) =>
      (value ?? "").toLowerCase().includes(normalizedQuery);

    return {
      sections: searchScope === "artists"
        ? []
        : books.flatMap((book) =>
            (book.sections ?? [])
              .map((section) => {
                const sectionMatches = matches(book.title) || matches(book.composer) || matches(section.title);
                const exercises = sectionMatches ? section.exercises ?? [] : [];

                return exercises.length
                  ? {
                      book,
                      exercises,
                      section,
                    }
                  : null;
              })
              .filter((result): result is { book: Book; exercises: Exercise[]; section: Section } =>
                Boolean(result),
              ),
          ),
      artists: searchScope === "books"
        ? []
        : artists
            .map((artist) => {
              const artistMatches = matches(artist.name);
              const songs = (artist.songs ?? []).filter((song) => artistMatches || matches(song.title));

              return songs.length ? { artist, songs } : null;
            })
            .filter((result): result is { artist: Artist; songs: Song[] } => Boolean(result)),
    };
  }, [artists, books, normalizedQuery, searchScope]);

  const selectedCount = selectedKeys.length;

  function resetSearch(value: string) {
    setQuery(value);
  }

  function toggleItem(key: string, scope: string, checked: boolean) {
    setSelection((current) => {
      const baseKeys = current.scope === scope ? current.keys : [];
      const keys = checked
        ? Array.from(new Set([...baseKeys, key]))
        : baseKeys.filter((selectedKey) => selectedKey !== key);

      return {
        keys,
        scope: keys.length ? scope : null,
      };
    });
  }

  return (
    <div className="space-y-4">
      {selectedKeys.map((key) => (
        <input key={key} type="hidden" name={inputName} value={key} />
      ))}

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <Field label="Search">
          <TextInput
            placeholder="Search songs, artists, books, or sections"
            value={query}
            onChange={(event) => resetSearch(event.target.value)}
          />
        </Field>
        <div className="soft-stat px-4 py-3 text-sm font-medium text-base-content/75 md:min-w-36">
          {selectedCount} selected
        </div>
      </div>

      <div className="max-h-[calc(75vh-13rem)] min-h-80 overflow-y-auto rounded-sm border border-base-300 bg-base-100 p-4">
        {normalizedQuery ? (
          <SearchResults
            artists={searchResults.artists}
            sections={searchResults.sections}
            selectedKeys={selectedKeys}
            onToggle={toggleItem}
          />
        ) : (
          <BrowseView
            artists={artists}
            books={books}
            currentArtist={currentArtist}
            currentBook={currentBook}
            currentSection={currentSection}
            onBack={setView}
            onToggle={toggleItem}
            selectedKeys={selectedKeys}
            view={view}
          />
        )}
      </div>
    </div>
  );
}

function BrowseView({
  artists,
  books,
  currentArtist,
  currentBook,
  currentSection,
  onBack,
  onToggle,
  selectedKeys,
  view,
}: {
  artists: Artist[];
  books: Book[];
  currentArtist: Artist | null;
  currentBook: Book | null;
  currentSection: Section | null;
  onBack: (view: PickerView) => void;
  onToggle: (key: string, scope: string, checked: boolean) => void;
  selectedKeys: string[];
  view: PickerView;
}) {
  if (view.type === "root") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <PickerNavButton
          meta={`${countExercises(books)} exercises`}
          title="Books"
          onClick={() => onBack({ type: "books" })}
        />
        <PickerNavButton
          meta={`${countSongs(artists)} songs`}
          title="Artists"
          onClick={() => onBack({ type: "artists" })}
        />
      </div>
    );
  }

  if (view.type === "books") {
    return (
      <div className="space-y-3">
        <PickerBackButton label="Library" onClick={() => onBack(ROOT_VIEW)} />
        {books.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {books.map((book) => (
              <PickerNavButton
                key={book.id}
                meta={`${book.sections?.length ?? 0} sections`}
                title={book.title}
                onClick={() => onBack({ type: "book", bookId: book.id })}
              />
            ))}
          </div>
        ) : (
          <EmptyState label="No books yet." />
        )}
      </div>
    );
  }

  if (view.type === "book") {
    return (
      <div className="space-y-3">
        <PickerBackButton label="Books" onClick={() => onBack({ type: "books" })} />
        <PickerHeading title={currentBook?.title ?? "Book"} meta={currentBook?.composer ?? null} />
        {currentBook?.sections?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {currentBook.sections.map((section) => (
              <PickerNavButton
                key={section.id}
                meta={`${section.exercises?.length ?? 0} exercises`}
                title={section.title}
                onClick={() => onBack({ type: "section", bookId: currentBook.id, sectionId: section.id })}
              />
            ))}
          </div>
        ) : (
          <EmptyState label="No sections yet." />
        )}
      </div>
    );
  }

  if (view.type === "section") {
    return (
      <div className="space-y-3">
        <PickerBackButton label={currentBook?.title ?? "Book"} onClick={() => onBack({ type: "book", bookId: view.bookId })} />
        <PickerHeading title={currentSection?.title ?? "Section"} meta={currentBook?.title ?? null} />
        <SelectableItems
          items={(currentSection?.exercises ?? []).map((exercise) => ({
            key: `exercise:${exercise.id}`,
            label: exercise.title,
            scope: `section:${currentSection?.id}`,
          }))}
          selectedKeys={selectedKeys}
          onToggle={onToggle}
          emptyLabel="No exercises yet."
        />
      </div>
    );
  }

  if (view.type === "artists") {
    return (
      <div className="space-y-3">
        <PickerBackButton label="Library" onClick={() => onBack(ROOT_VIEW)} />
        {artists.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {artists.map((artist) => (
              <PickerNavButton
                key={artist.id}
                meta={`${artist.songs?.length ?? 0} songs`}
                title={artist.name}
                onClick={() => onBack({ type: "artist", artistId: artist.id })}
              />
            ))}
          </div>
        ) : (
          <EmptyState label="No artists yet." />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PickerBackButton label="Artists" onClick={() => onBack({ type: "artists" })} />
      <PickerHeading title={currentArtist?.name ?? "Artist"} />
      <SelectableItems
        items={(currentArtist?.songs ?? []).map((song) => ({
          key: `song:${song.id}`,
          label: song.title,
          scope: `artist:${currentArtist?.id}`,
        }))}
        selectedKeys={selectedKeys}
        onToggle={onToggle}
        emptyLabel="No songs yet."
      />
    </div>
  );
}

function SearchResults({
  artists,
  onToggle,
  sections,
  selectedKeys,
}: {
  artists: Array<{ artist: Artist; songs: Song[] }>;
  onToggle: (key: string, scope: string, checked: boolean) => void;
  sections: Array<{ book: Book; exercises: Exercise[]; section: Section }>;
  selectedKeys: string[];
}) {
  if (!artists.length && !sections.length) {
    return <EmptyState label="No matching items." />;
  }

  return (
    <div className={sections.length && artists.length ? "grid gap-4 lg:grid-cols-2" : "space-y-4"}>
      {sections.length ? (
        <div className="space-y-3">
          <PickerHeading title="Books" />
          {sections.map(({ book, exercises, section }) => (
            <div
              key={section.id}
              className="section-panel p-3 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_#0a0a0a]"
            >
              <PickerHeading title={section.title} meta={book.title} />
              <SelectableItems
                className="mt-3"
                items={exercises.map((exercise) => ({
                  key: `exercise:${exercise.id}`,
                  label: exercise.title,
                  scope: `section:${section.id}`,
                }))}
                selectedKeys={selectedKeys}
                onToggle={onToggle}
                emptyLabel="No matching exercises."
              />
            </div>
          ))}
        </div>
      ) : null}
      {artists.length ? (
        <div className="space-y-3">
          <PickerHeading title="Artists" />
          {artists.map(({ artist, songs }) => (
            <div
              key={artist.id}
              className="section-panel p-3 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_#0a0a0a]"
            >
              <PickerHeading title={artist.name} />
              <SelectableItems
                className="mt-3"
                items={songs.map((song) => ({
                  key: `song:${song.id}`,
                  label: song.title,
                  scope: `artist:${artist.id}`,
                }))}
                selectedKeys={selectedKeys}
                onToggle={onToggle}
                emptyLabel="No matching songs."
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SelectableItems({
  className,
  emptyLabel,
  items,
  onToggle,
  selectedKeys,
}: {
  className?: string;
  emptyLabel: string;
  items: Array<{ key: string; label: string; scope: string }>;
  onToggle: (key: string, scope: string, checked: boolean) => void;
  selectedKeys: string[];
}) {
  if (!items.length) {
    return <EmptyState label={emptyLabel} />;
  }

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {items.map((item) => (
        <label
          key={item.key}
          className="flex min-h-12 items-center justify-between gap-3 border border-base-300 bg-white px-3 py-2 text-sm font-medium transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_#0a0a0a]"
        >
          <span className="line-clamp-2">{item.label}</span>
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={selectedKeys.includes(item.key)}
            onChange={(event) => onToggle(item.key, item.scope, event.target.checked)}
          />
        </label>
      ))}
    </div>
  );
}

function PickerNavButton({
  meta,
  onClick,
  title,
}: {
  meta?: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      className="accent-card p-4 text-left transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#0a0a0a]"
      onClick={onClick}
    >
      <span className="block text-base font-semibold text-base-content">{title}</span>
      {meta ? <span className="mt-1 block text-sm text-base-content/80">{meta}</span> : null}
    </button>
  );
}

function PickerBackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={onClick}>
      Back to {label}
    </button>
  );
}

function PickerHeading({ meta, title }: { meta?: string | null; title: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/75">{title}</h3>
      {meta ? <p className="mt-1 text-sm text-base-content/80">{meta}</p> : null}
    </div>
  );
}

function countExercises(books: Book[]) {
  return books.reduce(
    (sum, book) =>
      sum + (book.sections ?? []).reduce((sectionSum, section) => sectionSum + (section.exercises?.length ?? 0), 0),
    0,
  );
}

function countSongs(artists: Artist[]) {
  return artists.reduce((sum, artist) => sum + (artist.songs?.length ?? 0), 0);
}

function getSearchScope(view: PickerView): SearchScope {
  if (view.type === "artists" || view.type === "artist") {
    return "artists";
  }

  if (view.type === "books" || view.type === "book" || view.type === "section") {
    return "books";
  }

  return "all";
}
