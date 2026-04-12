import type { ReactNode } from "react";
import {
  createArtistAction,
  createBookAction,
  createExerciseAction,
  createSectionAction,
  createSongAction,
  updateArtistAction,
  updateBookAction,
  updateExerciseAction,
  updateSectionAction,
  updateSongAction,
} from "@/app/(app)/library/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { PracticeItemPicker } from "@/components/practice-item-picker";
import type { LibrarySnapshot } from "@/lib/data/library";

type LibraryManagerProps = {
  snapshot: LibrarySnapshot;
};

export function LibraryManager({ snapshot }: LibraryManagerProps) {
  const exerciseCount = snapshot.books.reduce(
    (sum, book) =>
      sum +
      (book.sections ?? []).reduce((sectionSum, section) => sectionSum + (section.exercises?.length ?? 0), 0),
    0,
  );
  const songCount = snapshot.artists.reduce((sum, artist) => sum + (artist.songs?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-base-300/70 bg-base-100/85 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">Library</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              Build the material you actually practice.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-base-content/75 md:text-base">
              This page now manages books, sections, exercises, artists, and songs directly against the
              live backend. Goal tempos can be set at the book, section, exercise, and song levels.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:min-w-[20rem]">
            <StatCard label="Books" value={String(snapshot.books.length)} />
            <StatCard label="Exercises" value={String(exerciseCount)} />
            <StatCard label="Artists" value={String(snapshot.artists.length)} />
            <StatCard label="Songs" value={String(songCount)} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/80 p-6 shadow-sm">
            <SectionHeader
              title="Books -> Sections -> Exercises"
              description="Use section defaults to guide tempo targets, then override individual exercises where needed."
            />
            <div className="mt-5 space-y-4">
              {snapshot.books.length ? (
                snapshot.books.map((book) => (
                  <details
                    key={book.id}
                    className="group rounded-[1.5rem] border border-base-300/70 bg-base-200/50 p-5"
                    open
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-base-content">{book.title}</h2>
                          <p className="text-sm text-base-content/65">
                            {book.composer || "No composer set"} · Book default goal{" "}
                            {book.default_goal_tempo ? `${book.default_goal_tempo} BPM` : "unset"}
                          </p>
                        </div>
                        <span className="badge badge-outline">
                          {(book.sections ?? []).length} section{(book.sections ?? []).length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </summary>
                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                      <EditBookForm book={book} />
                      <CreateSectionForm bookId={book.id} />
                    </div>
                    <div className="mt-4 space-y-3">
                      {(book.sections ?? []).length ? (
                        book.sections.map((section) => (
                          <div key={section.id} className="rounded-[1.25rem] bg-base-100 p-4 shadow-sm">
                            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                              <EditSectionForm section={section} />
                              <CreateExerciseForm sectionId={section.id} inheritedTempo={section.default_goal_tempo} />
                            </div>
                            <div className="mt-4 space-y-3">
                              {(section.exercises ?? []).length ? (
                                section.exercises.map((exercise) => (
                                  <EditExerciseForm
                                    key={exercise.id}
                                    exercise={exercise}
                                    inheritedTempo={exercise.goal_tempo ?? section.default_goal_tempo ?? book.default_goal_tempo ?? null}
                                  />
                                ))
                              ) : (
                                <EmptyBox label="No exercises yet. Add the first item in this section." />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptyBox label="No sections yet. Create one to start tracking exercises." />
                      )}
                    </div>
                  </details>
                ))
              ) : (
                <EmptyBox label="No books yet. Add one from the form column to begin building your practice library." />
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/80 p-6 shadow-sm">
            <SectionHeader
              title="Artists -> Songs"
              description="Songs can carry their own goal tempos and will later plug directly into setlists and sessions."
            />
            <div className="mt-5 space-y-4">
              {snapshot.artists.length ? (
                snapshot.artists.map((artist) => (
                  <details key={artist.id} className="rounded-[1.5rem] border border-base-300/70 bg-base-200/50 p-5" open>
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-base-content">{artist.name}</h2>
                          <p className="text-sm text-base-content/65">
                            {(artist.songs ?? []).length} song{(artist.songs ?? []).length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                    </summary>
                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                      <EditArtistForm artist={artist} />
                      <CreateSongForm artistId={artist.id} />
                    </div>
                    <div className="mt-4 space-y-3">
                      {(artist.songs ?? []).length ? (
                        artist.songs.map((song) => <EditSongForm key={song.id} song={song} />)
                      ) : (
                        <EmptyBox label="No songs yet. Add one to track tempo progress here." />
                      )}
                    </div>
                  </details>
                ))
              ) : (
                <EmptyBox label="No artists yet. Add one from the form column to begin tracking songs." />
              )}
            </div>
          </div>

          <PracticeItemPicker snapshot={snapshot} />
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/80 p-6 shadow-sm">
            <SectionHeader
              title="Add Books and Artists"
              description="Create top-level library containers first, then fill in sections, exercises, and songs."
            />
            <div className="mt-5 space-y-5">
              <CreateBookForm />
              <div className="divider my-0" />
              <CreateArtistForm />
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-dashed border-secondary/35 bg-secondary/8 p-6">
            <h2 className="text-lg font-semibold text-base-content">Tempo inheritance</h2>
            <div className="mt-3 space-y-3 text-sm leading-6 text-base-content/75">
              <p>A book default can suggest a tempo for every section beneath it.</p>
              <p>A section default can narrow that target before individual exercises override it.</p>
              <p>Songs keep their goal tempo directly at the song level.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-base-content">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-base-content/75">{description}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-base-200/70 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-base-content">{value}</p>
    </div>
  );
}

function EmptyBox({ label }: { label: string }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-base-300 bg-base-100 px-4 py-4 text-sm text-base-content/65">
      {label}
    </div>
  );
}

function CardForm({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.25rem] border border-base-300/70 bg-base-100 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-base-content/60">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-base-content/70">{description}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Input({
  defaultValue,
  label,
  min,
  name,
  placeholder,
  type = "text",
}: {
  defaultValue?: string | number | null;
  label: string;
  min?: number;
  name: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="form-control w-full">
      <span className="label-text mb-2 text-sm font-medium text-base-content">{label}</span>
      <input
        className="input input-bordered w-full"
        defaultValue={defaultValue ?? ""}
        min={min}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

function CreateBookForm() {
  return (
    <form action={createBookAction}>
      <CardForm title="Add book" description="Start a book hierarchy such as Stick Control or Syncopation.">
        <Input label="Title" name="title" placeholder="Stick Control" />
        <Input label="Composer or author" name="composer" placeholder="George Lawrence Stone" />
        <Input label="Default goal tempo" name="defaultGoalTempo" placeholder="120" type="number" min={1} />
        <FormSubmitButton label="Create book" />
      </CardForm>
    </form>
  );
}

function EditBookForm({
  book,
}: {
  book: LibrarySnapshot["books"][number];
}) {
  return (
    <form action={updateBookAction}>
      <input type="hidden" name="bookId" value={book.id} />
      <CardForm title="Edit book" description="Adjust the title, composer, and default book-level tempo target.">
        <Input label="Title" name="title" defaultValue={book.title} />
        <Input label="Composer or author" name="composer" defaultValue={book.composer} />
        <Input
          label="Default goal tempo"
          name="defaultGoalTempo"
          defaultValue={book.default_goal_tempo}
          type="number"
          min={1}
        />
        <FormSubmitButton label="Save book" pendingLabel="Saving book..." className="btn btn-secondary btn-sm" />
      </CardForm>
    </form>
  );
}

function CreateSectionForm({ bookId }: { bookId: string }) {
  return (
    <form action={createSectionAction}>
      <input type="hidden" name="bookId" value={bookId} />
      <CardForm title="Add section" description="Sections group related exercises and can carry their own default tempo.">
        <Input label="Section title" name="title" placeholder="Triplet Grid" />
        <Input label="Position" name="position" defaultValue={1} type="number" />
        <Input label="Default goal tempo" name="defaultGoalTempo" type="number" min={1} placeholder="132" />
        <FormSubmitButton label="Create section" className="btn btn-accent btn-sm" pendingLabel="Creating..." />
      </CardForm>
    </form>
  );
}

function EditSectionForm({
  section,
}: {
  section: NonNullable<LibrarySnapshot["books"][number]["sections"]>[number];
}) {
  return (
    <form action={updateSectionAction}>
      <input type="hidden" name="sectionId" value={section.id} />
      <CardForm title="Edit section" description="Change the section label, order, and default target tempo.">
        <Input label="Section title" name="title" defaultValue={section.title} />
        <Input label="Position" name="position" defaultValue={section.position} type="number" />
        <Input
          label="Default goal tempo"
          name="defaultGoalTempo"
          defaultValue={section.default_goal_tempo}
          type="number"
          min={1}
        />
        <FormSubmitButton label="Save section" className="btn btn-secondary btn-sm" pendingLabel="Saving..." />
      </CardForm>
    </form>
  );
}

function CreateExerciseForm({
  inheritedTempo,
  sectionId,
}: {
  inheritedTempo: number | null;
  sectionId: string;
}) {
  return (
    <form action={createExerciseAction}>
      <input type="hidden" name="sectionId" value={sectionId} />
      <CardForm
        title="Add exercise"
        description={`Create the next exercise. Inherited default: ${inheritedTempo ? `${inheritedTempo} BPM` : "none"}.`}
      >
        <Input label="Exercise title" name="title" placeholder="Exercise 1" />
        <Input label="Position" name="position" defaultValue={1} type="number" />
        <Input label="Goal tempo" name="goalTempo" type="number" min={1} placeholder="Override if needed" />
        <FormSubmitButton label="Create exercise" className="btn btn-accent btn-sm" pendingLabel="Creating..." />
      </CardForm>
    </form>
  );
}

function EditExerciseForm({
  exercise,
  inheritedTempo,
}: {
  exercise: NonNullable<NonNullable<LibrarySnapshot["books"][number]["sections"]>[number]["exercises"]>[number];
  inheritedTempo: number | null;
}) {
  return (
    <form action={updateExerciseAction} className="rounded-[1rem] border border-base-300/70 bg-base-200/55 p-4">
      <input type="hidden" name="exerciseId" value={exercise.id} />
      <div className="grid gap-3 md:grid-cols-[1.2fr_0.6fr_0.8fr_auto] md:items-end">
        <Input label="Exercise" name="title" defaultValue={exercise.title} />
        <Input label="Position" name="position" defaultValue={exercise.position} type="number" />
        <Input
          label={`Goal tempo${inheritedTempo ? ` (${inheritedTempo} BPM inherited)` : ""}`}
          name="goalTempo"
          defaultValue={exercise.goal_tempo}
          type="number"
          min={1}
        />
        <FormSubmitButton
          label="Save"
          pendingLabel="Saving..."
          className="btn btn-ghost btn-sm border border-base-300 md:mb-[0.35rem]"
        />
      </div>
    </form>
  );
}

function CreateArtistForm() {
  return (
    <form action={createArtistAction}>
      <CardForm title="Add artist" description="Track songs outside the book hierarchy with a simple artist -> song structure.">
        <Input label="Artist name" name="name" placeholder="John Coltrane" />
        <FormSubmitButton label="Create artist" className="btn btn-primary btn-sm" pendingLabel="Creating..." />
      </CardForm>
    </form>
  );
}

function EditArtistForm({
  artist,
}: {
  artist: LibrarySnapshot["artists"][number];
}) {
  return (
    <form action={updateArtistAction}>
      <input type="hidden" name="artistId" value={artist.id} />
      <CardForm title="Edit artist" description="Rename the artist heading used to organize related songs.">
        <Input label="Artist name" name="name" defaultValue={artist.name} />
        <FormSubmitButton label="Save artist" className="btn btn-secondary btn-sm" pendingLabel="Saving..." />
      </CardForm>
    </form>
  );
}

function CreateSongForm({ artistId }: { artistId: string }) {
  return (
    <form action={createSongAction}>
      <input type="hidden" name="artistId" value={artistId} />
      <CardForm title="Add song" description="Songs can have their own explicit goal tempo from the start.">
        <Input label="Song title" name="title" placeholder="Giant Steps" />
        <Input label="Goal tempo" name="goalTempo" type="number" min={1} placeholder="220" />
        <FormSubmitButton label="Create song" className="btn btn-accent btn-sm" pendingLabel="Creating..." />
      </CardForm>
    </form>
  );
}

function EditSongForm({
  song,
}: {
  song: NonNullable<LibrarySnapshot["artists"][number]["songs"]>[number];
}) {
  return (
    <form action={updateSongAction} className="rounded-[1rem] border border-base-300/70 bg-base-200/55 p-4">
      <input type="hidden" name="songId" value={song.id} />
      <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto] md:items-end">
        <Input label="Song" name="title" defaultValue={song.title} />
        <Input label="Goal tempo" name="goalTempo" defaultValue={song.goal_tempo} type="number" min={1} />
        <FormSubmitButton
          label="Save"
          pendingLabel="Saving..."
          className="btn btn-ghost btn-sm border border-base-300 md:mb-[0.35rem]"
        />
      </div>
    </form>
  );
}
