import Link from "next/link";
import {
  reorderBookSectionsAction,
  saveSectionBuilderAction,
  updateArtistAction,
  updateBookAction,
} from "@/app/(app)/library/actions";
import { DraggableBookSections } from "@/components/draggable-book-sections";
import { SectionBuilderForm } from "@/components/section-builder-form";
import { FormSubmitButton } from "@/components/form-submit-button";
import {
  EmptyState,
  PageHero,
  PagePanel,
  StatCard,
  TextInput,
} from "@/components/ui/primitives";
import type { LibrarySnapshot } from "@/lib/data/library";
import {
  CreateSongForm,
  EditSongForm,
  SectionHeader,
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
      <PageHero
        backHref="/library"
        backLabel="Back to library"
        eyebrow="Book"
        title={book.title}
        stats={
          <div className="grid grid-cols-2 gap-3 md:min-w-[18rem]">
            <StatCard label="Sections" value={String(sectionCount)} />
            <StatCard label="Exercises" value={String(exerciseCount)} />
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          <span className="chip chip-neutral">{book.composer || "No composer set"}</span>
        </div>
      </PageHero>

      <section className="space-y-6">
        <PagePanel>
          <form action={updateBookAction} className="max-w-3xl space-y-4">
            <input type="hidden" name="bookId" value={book.id} />
            <TextInput
              className="w-full border-0 bg-transparent p-0 font-display text-3xl font-semibold tracking-tight text-base-content outline-none md:text-4xl"
              name="title"
              defaultValue={book.title}
            />
            <TextInput
              className="w-full border-0 bg-transparent p-0 text-lg text-base-content/70 outline-none"
              name="composer"
              defaultValue={book.composer ?? ""}
              placeholder="Composer or author"
            />
            <FormSubmitButton label="Save" pendingLabel="Saving..." variant="secondary" />
          </form>
        </PagePanel>

        <PagePanel>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionHeader
              title="Sections"
            />
            <Link href={`/library/books/${book.id}/sections/new`} className="btn btn-primary">
              Add section
            </Link>
          </div>

          <div className="mt-5">
            {sectionCount ? (
              <DraggableBookSections
                bookId={book.id}
                onReorder={reorderBookSectionsAction}
                sections={(book.sections ?? [])
                  .slice()
                  .sort((left, right) => left.position - right.position)
                  .map((section) => ({
                    exerciseCount: section.exercises?.length ?? 0,
                    id: section.id,
                    title: section.title,
                  }))}
              />
            ) : (
              <EmptyState label="No sections yet. Add your first section." />
            )}
          </div>
        </PagePanel>
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
      <PageHero
        backHref="/library"
        backLabel="Back to library"
        eyebrow="Artist"
        title={artist.name}
        stats={
          <div className="grid grid-cols-1 gap-3 md:min-w-[12rem]">
            <StatCard label="Songs" value={String(songCount)} />
          </div>
        }
      />

      <section className="space-y-6">
        <PagePanel>
          <form action={updateArtistAction} className="max-w-3xl space-y-4">
            <input type="hidden" name="artistId" value={artist.id} />
            <TextInput
              className="w-full border-0 bg-transparent p-0 font-display text-3xl font-semibold tracking-tight text-base-content outline-none md:text-4xl"
              name="name"
              defaultValue={artist.name}
            />
            <FormSubmitButton label="Save" pendingLabel="Saving..." variant="secondary" />
          </form>
        </PagePanel>

        <PagePanel>
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
              <EmptyState label="No songs yet. Add your first song." />
            )}
          </div>
        </PagePanel>
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
      <PageHero
        backHref={`/library/books/${book.id}`}
        backLabel={`Back to ${book.title}`}
        eyebrow="Section"
        title={section ? section.title : "New section"}
      />

      <section className="space-y-6">
        <SectionBuilderForm
          action={saveSectionBuilderAction}
          bookId={book.id}
          mode={section ? "edit" : "create"}
          section={section}
        />

        {section ? (
          <PagePanel>
            <SectionHeader
              title="Current Exercises"
            />
            <div className="mt-5 space-y-3">
              {section.exercises?.length ? (
                section.exercises.map((exercise) => (
                  <div key={exercise.id} className="list-row p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-base-content">{exercise.title}</p>
                      <span className="chip">
                        Goal {exercise.goal_tempo ? `${exercise.goal_tempo} BPM` : "unset"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState label="No exercises yet for this section." />
              )}
            </div>
          </PagePanel>
        ) : null}
      </section>
    </div>
  );
}
