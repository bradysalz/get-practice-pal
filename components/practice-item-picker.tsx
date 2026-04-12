"use client";

import { useMemo, useState } from "react";
import type { LibrarySnapshot } from "@/lib/data/library";

type PracticeItemPickerProps = {
  snapshot: Pick<LibrarySnapshot, "artists" | "books">;
};

type SelectedMap = Record<string, boolean>;

export function PracticeItemPicker({ snapshot }: PracticeItemPickerProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SelectedMap>({});
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const matches = (value: string) => value.toLowerCase().includes(normalizedQuery);

    return {
      books: snapshot.books
        .map((book) => ({
          ...book,
          sections: (book.sections ?? [])
            .map((section) => ({
              ...section,
              exercises: (section.exercises ?? []).filter((exercise) => matches(exercise.title)),
            }))
            .filter(
              (section) =>
                matches(section.title) ||
                section.exercises.length > 0 ||
                matches(book.title) ||
                matches(book.composer ?? ""),
            ),
        }))
        .filter(
          (book) =>
            matches(book.title) ||
            matches(book.composer ?? "") ||
            book.sections.length > 0,
        ),
      artists: snapshot.artists
        .map((artist) => ({
          ...artist,
          songs: (artist.songs ?? []).filter((song) => matches(song.title)),
        }))
        .filter((artist) => matches(artist.name) || artist.songs.length > 0),
    };
  }, [normalizedQuery, snapshot.artists, snapshot.books]);

  const selectedItems = Object.keys(selected).filter((key) => selected[key]);

  return (
    <section className="page-panel p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Nested Picker</p>
          <h2 className="font-display mt-2 text-xl font-semibold text-base-content">
            Reusable practice item selector
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/75">
            This picker is built for upcoming setlist and session flows. It already supports nested
            browsing and lightweight search across exercises and songs.
          </p>
        </div>
        <label className="form-control w-full md:max-w-sm">
          <span className="label-text mb-2 text-sm font-medium text-base-content">Search items</span>
          <input
            className="input input-bordered w-full"
            placeholder="Search books, sections, exercises, artists, or songs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <div className="soft-stat mt-4 px-4 py-3 text-sm text-base-content/75">
        {selectedItems.length
          ? `${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"} selected`
          : "Select a few exercises or songs to preview later session and setlist behavior."}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-base-content/60">
            Books
          </h3>
          {filtered.books.length ? (
            filtered.books.map((book) => (
              <div key={book.id} className="accent-card p-4">
                <p className="text-base font-semibold text-base-content">{book.title}</p>
                <p className="text-sm text-base-content/65">{book.composer || "No composer set"}</p>
                <div className="mt-3 space-y-3">
                  {book.sections.map((section) => (
                    <div key={section.id} className="section-panel p-3">
                      <p className="text-sm font-semibold text-base-content">{section.title}</p>
                      <div className="mt-2 space-y-2">
                        {section.exercises.map((exercise) => {
                          const key = `exercise:${exercise.id}`;

                          return (
                            <label
                              key={exercise.id}
                                className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm"
                            >
                              <span>{exercise.title}</span>
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={Boolean(selected[key])}
                                onChange={(event) =>
                                  setSelected((current) => ({
                                    ...current,
                                    [key]: event.target.checked,
                                  }))
                                }
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-box p-5 text-sm">
              No matching exercises yet.
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-base-content/60">
            Artists
          </h3>
          {filtered.artists.length ? (
            filtered.artists.map((artist) => (
              <div key={artist.id} className="accent-card p-4">
                <p className="text-base font-semibold text-base-content">{artist.name}</p>
                <div className="mt-3 space-y-2">
                  {artist.songs.map((song) => {
                    const key = `song:${song.id}`;

                    return (
                      <label
                        key={song.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-base-200/85 px-3 py-2 text-sm"
                      >
                        <span>{song.title}</span>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={Boolean(selected[key])}
                          onChange={(event) =>
                            setSelected((current) => ({
                              ...current,
                              [key]: event.target.checked,
                            }))
                          }
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-box p-5 text-sm">
              No matching songs yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
