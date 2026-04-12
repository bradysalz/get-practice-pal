import Link from "next/link";
import {
  saveSectionBuilderAction,
  updateArtistAction,
  updateBookAction,
} from "@/app/(app)/library/actions";
import { SectionBuilderForm } from "@/components/section-builder-form";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { LibrarySnapshot } from "@/lib/data/library";
import {
  CreateSongForm,
  EditSongForm,
  EmptyBox,
  SectionHeader,
  StatCard,
} from "@/components/library-manager";

export function BookDetailPage({
  book,
}: {
  book: LibrarySnapshot["books"][number];
}) {
  const sectionCount = book.sections?.length ?? 0;
  const exerciseCount = (book.sections ?? []).reduce(
    (sum, section) => sum + (section.exercises?.length ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <section className="page-hero p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <Link href="/library" className="text-sm font-medium text-primary">
              Back to library
            </Link>
            <p className="eyebrow mt-4">Book</p>
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              {book.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip chip-neutral">{book.composer || "No composer set"}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:min-w-[18rem]">
            <StatCard label="Sections" value={String(sectionCount)} />
            <StatCard label="Exercises" value={String(exerciseCount)} />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <section className="page-panel p-6">
          <form action={updateBookAction} className="max-w-3xl space-y-4">
            <input type="hidden" name="bookId" value={book.id} />
            <input
              className="w-full border-0 bg-transparent p-0 font-display text-3xl font-semibold tracking-tight text-base-content outline-none md:text-4xl"
              name="title"
              defaultValue={book.title}
            />
            <input
              className="w-full border-0 bg-transparent p-0 text-lg text-base-content/70 outline-none"
              name="composer"
              defaultValue={book.composer ?? ""}
              placeholder="Composer or author"
            />
            <FormSubmitButton label="Save" pendingLabel="Saving..." className="btn btn-secondary btn-sm" />
          </form>
        </section>

        <section className="page-panel p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionHeader
              title="Sections"
            />
            <Link href={`/library/books/${book.id}/sections/new`} className="btn btn-primary">
              Add section
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {sectionCount ? (
              (book.sections ?? []).map((section) => (
                <details key={section.id} className="section-panel p-5">
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-base-content">{section.title}</h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="chip chip-neutral text-[0.72rem]">
                            Position {section.position}
                          </span>
                          <span className="chip text-[0.72rem]">
                            Default {section.default_goal_tempo ? `${section.default_goal_tempo} BPM` : "unset"}
                          </span>
                          <span className="chip chip-neutral text-[0.72rem]">
                            {(section.exercises ?? []).length} exercise
                            {(section.exercises ?? []).length === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-primary">Open</span>
                    </div>
                  </summary>

                  <div className="mt-4 space-y-3 border-t border-base-300/70 pt-4">
                    {(section.exercises ?? []).length ? (
                      <div className="flex flex-wrap gap-2">
                        {section.exercises?.slice(0, 8).map((exercise) => (
                          <span key={exercise.id} className="chip chip-neutral text-[0.72rem]">
                            {exercise.title}
                          </span>
                        ))}
                        {(section.exercises?.length ?? 0) > 8 ? (
                          <span className="chip chip-neutral text-[0.72rem]">
                            +{(section.exercises?.length ?? 0) - 8} more
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-sm text-base-content/60">No exercises yet.</p>
                    )}

                    <Link
                      href={`/library/books/${book.id}/sections/${section.id}`}
                      className="btn btn-ghost btn-sm border border-base-300"
                    >
                      Edit section
                    </Link>
                  </div>
                </details>
              ))
            ) : (
              <EmptyBox label="No sections yet. Add your first section." />
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

export function ArtistDetailPage({
  artist,
}: {
  artist: LibrarySnapshot["artists"][number];
}) {
  const songCount = artist.songs?.length ?? 0;

  return (
    <div className="space-y-6">
      <section className="page-hero p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <Link href="/library" className="text-sm font-medium text-primary">
              Back to library
            </Link>
            <p className="eyebrow mt-4">Artist</p>
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              {artist.name}
            </h1>
          </div>
          <div className="grid grid-cols-1 gap-3 md:min-w-[12rem]">
            <StatCard label="Songs" value={String(songCount)} />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <section className="page-panel p-6">
          <form action={updateArtistAction} className="max-w-3xl space-y-4">
            <input type="hidden" name="artistId" value={artist.id} />
            <input
              className="w-full border-0 bg-transparent p-0 font-display text-3xl font-semibold tracking-tight text-base-content outline-none md:text-4xl"
              name="name"
              defaultValue={artist.name}
            />
            <FormSubmitButton label="Save" pendingLabel="Saving..." className="btn btn-secondary btn-sm" />
          </form>
        </section>

        <section className="page-panel p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionHeader
              title="Songs"
            />
            <div className="max-w-sm">
              <CreateSongForm artistId={artist.id} />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {songCount ? (
              (artist.songs ?? []).map((song) => <EditSongForm key={song.id} song={song} />)
            ) : (
              <EmptyBox label="No songs yet. Add your first song." />
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

export function SectionDetailPage({
  book,
  section,
}: {
  book: LibrarySnapshot["books"][number];
  section?: NonNullable<LibrarySnapshot["books"][number]["sections"]>[number];
}) {
  return (
    <div className="space-y-6">
      <section className="page-hero p-6 md:p-8">
        <div className="max-w-3xl">
          <Link href={`/library/books/${book.id}`} className="text-sm font-medium text-primary">
            Back to {book.title}
          </Link>
          <p className="eyebrow mt-4">Section</p>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
            {section ? section.title : "New section"}
          </h1>
        </div>
      </section>

      <section className="space-y-6">
        <SectionBuilderForm
          action={saveSectionBuilderAction}
          bookId={book.id}
          mode={section ? "edit" : "create"}
          section={section}
        />

        {section ? (
          <section className="page-panel p-6">
            <SectionHeader
              title="Current Exercises"
            />
            <div className="mt-5 space-y-3">
              {section.exercises?.length ? (
                section.exercises.map((exercise) => (
                  <div key={exercise.id} className="accent-card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-base-content">{exercise.title}</p>
                      <span className="chip chip-neutral text-[0.72rem]">
                        Position {exercise.position}
                      </span>
                      <span className="chip text-[0.72rem]">
                        Goal {exercise.goal_tempo ? `${exercise.goal_tempo} BPM` : "unset"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyBox label="No exercises yet for this section." />
              )}
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
