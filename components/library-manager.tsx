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
import { ActionModal } from "@/components/action-modal";
import {
  CardLink,
  EmptyState,
  Field,
  PageHero,
  PagePanel,
  SectionTitle,
  StatCard as PrimitiveStatCard,
  TextInput,
} from "@/components/ui/primitives";
import type { LibrarySnapshot } from "@/lib/data/library";

type LibraryManagerProps = {
  snapshot: LibrarySnapshot;
};

export function LibraryManager({ snapshot }: LibraryManagerProps) {
  const exerciseCount = snapshot.books.reduce(
    (sum, book) =>
      sum +
      (book.sections ?? []).reduce(
        (sectionSum, section) => sectionSum + (section.exercises?.length ?? 0),
        0,
      ),
    0,
  );
  const songCount = snapshot.artists.reduce(
    (sum, artist) => sum + (artist.songs?.length ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Library"
        title="Keep your material organized."
        stats={
          <div className="grid grid-cols-2 gap-3 md:min-w-[20rem]">
            <StatCard label="Books" value={String(snapshot.books.length)} />
            <StatCard label="Exercises" value={String(exerciseCount)} />
            <StatCard label="Artists" value={String(snapshot.artists.length)} />
            <StatCard label="Songs" value={String(songCount)} />
          </div>
        }
      />

      <section className="space-y-6">
        <PagePanel>
          <SectionTitle
            title="Create"
            actions={
              <>
                <ActionModal title="Add book" triggerLabel="Add book">
                  <CreateBookForm />
                </ActionModal>
                <ActionModal title="Add artist" triggerLabel="Add artist">
                  <CreateArtistForm />
                </ActionModal>
              </>
            }
          />
        </PagePanel>

        <div className="space-y-6">
          <PagePanel>
            <SectionTitle title="Books" />
            <div className="mt-5 space-y-3">
              {snapshot.books.length ? (
                snapshot.books.map((book) => {
                  const sectionCount = book.sections?.length ?? 0;
                  const bookExerciseCount = (book.sections ?? []).reduce(
                    (sum, section) => sum + (section.exercises?.length ?? 0),
                    0,
                  );

                  return (
                    <CardLink key={book.id} href={`/library/books/${book.id}`}>
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-base-content">{book.title}</h2>
                          <p className="mt-2 text-sm text-base-content/65">
                            {book.composer || "No composer set"}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="chip chip-neutral ">
                              {sectionCount} section{sectionCount === 1 ? "" : "s"}
                            </span>
                            <span className="chip chip-neutral ">
                              {bookExerciseCount} exercise{bookExerciseCount === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wide text-primary">Open</span>
                      </div>
                    </CardLink>
                  );
                })
              ) : (
                <EmptyState label="No books yet. Add your first book." />
              )}
            </div>
          </PagePanel>

          <PagePanel>
            <SectionTitle title="Artists" />
            <div className="mt-5 space-y-3">
              {snapshot.artists.length ? (
                snapshot.artists.map((artist) => {
                  const artistSongCount = artist.songs?.length ?? 0;

                  return (
                    <CardLink key={artist.id} href={`/library/artists/${artist.id}`}>
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-base-content">{artist.name}</h2>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="chip chip-neutral ">
                              {artistSongCount} song{artistSongCount === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wide text-primary">Open</span>
                      </div>
                    </CardLink>
                  );
                })
              ) : (
                <EmptyState label="No artists yet. Add your first artist." />
              )}
            </div>
          </PagePanel>
        </div>
      </section>
    </div>
  );
}

export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-primary">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-base-content/75">{description}</p>
      ) : null}
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return <PrimitiveStatCard label={label} value={value} />;
}

export function EmptyBox({ label }: { label: string }) {
  return <EmptyState label={label} />;
}

export function CardForm({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="accent-card p-4">
      <h3 className="text-lg font-bold text-primary">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-base-content/70">{description}</p>
      ) : null}
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

export function Input({
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
    <Field label={label}>
      <TextInput
        defaultValue={defaultValue ?? ""}
        min={min}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </Field>
  );
}

export function CreateBookForm() {
  return (
    <form action={createBookAction}>
      <CardForm title="Add book" description="">
        <Input label="Title" name="title" placeholder="Stick Control" />
        <Input label="Composer or author" name="composer" placeholder="George Lawrence Stone" />
        <FormSubmitButton label="Create book" />
      </CardForm>
    </form>
  );
}

export function EditBookForm({
  book,
}: {
  book: LibrarySnapshot["books"][number];
}) {
  return (
    <form action={updateBookAction}>
      <input type="hidden" name="bookId" value={book.id} />
      <CardForm title="Edit book" description="">
        <Input label="Title" name="title" defaultValue={book.title} />
        <Input label="Composer or author" name="composer" defaultValue={book.composer} />
        <FormSubmitButton label="Save book" pendingLabel="Saving book..." variant="secondary" />
      </CardForm>
    </form>
  );
}

export function CreateSectionForm({ bookId }: { bookId: string }) {
  return (
    <form action={createSectionAction}>
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="position" value="1" />
      <CardForm
        title="Add section"
        description=""
      >
        <Input label="Section title" name="title" placeholder="Triplet Grid" />
        <Input
          label="Default goal tempo"
          name="defaultGoalTempo"
          type="number"
          min={1}
          placeholder="132"
        />
        <FormSubmitButton label="Create section" pendingLabel="Creating..." variant="accent" />
      </CardForm>
    </form>
  );
}

export function EditSectionForm({
  section,
}: {
  section: NonNullable<LibrarySnapshot["books"][number]["sections"]>[number];
}) {
  return (
    <form action={updateSectionAction}>
      <input type="hidden" name="sectionId" value={section.id} />
      <input type="hidden" name="position" value={String(section.position)} />
      <CardForm title="Edit section" description="">
        <Input label="Section title" name="title" defaultValue={section.title} />
        <Input
          label="Default goal tempo"
          name="defaultGoalTempo"
          defaultValue={section.default_goal_tempo}
          type="number"
          min={1}
        />
        <FormSubmitButton label="Save section" pendingLabel="Saving..." variant="secondary" />
      </CardForm>
    </form>
  );
}

export function CreateExerciseForm({
  inheritedTempo,
  sectionId,
}: {
  inheritedTempo: number | null;
  sectionId: string;
}) {
  return (
    <form action={createExerciseAction}>
      <input type="hidden" name="sectionId" value={sectionId} />
      <input type="hidden" name="position" value="1" />
      <CardForm
        title="Add exercise"
        description=""
      >
        <Input label="Exercise title" name="title" placeholder="Exercise 1" />
        <Input
          label="Goal tempo"
          name="goalTempo"
          type="number"
          min={1}
          placeholder="Override if needed"
        />
        <FormSubmitButton label="Create exercise" pendingLabel="Creating..." variant="accent" />
      </CardForm>
    </form>
  );
}

export function EditExerciseForm({
  exercise,
  inheritedTempo,
}: {
  exercise: NonNullable<
    NonNullable<LibrarySnapshot["books"][number]["sections"]>[number]["exercises"]
  >[number];
  inheritedTempo: number | null;
}) {
  return (
    <form action={updateExerciseAction} className="section-panel p-4">
      <input type="hidden" name="exerciseId" value={exercise.id} />
      <input type="hidden" name="position" value={String(exercise.position)} />
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="chip ">
          Inherited {inheritedTempo ? `${inheritedTempo} BPM` : "none"}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto] md:items-end">
        <Input label="Exercise" name="title" defaultValue={exercise.title} />
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
          className="btn btn-outline btn-sm md:mb-[0.35rem]"
        />
      </div>
    </form>
  );
}

export function CreateArtistForm() {
  return (
    <form action={createArtistAction}>
      <CardForm
        title="Add artist"
        description=""
      >
        <Input label="Artist name" name="name" placeholder="John Coltrane" />
        <FormSubmitButton label="Create artist" pendingLabel="Creating..." />
      </CardForm>
    </form>
  );
}

export function EditArtistForm({
  artist,
}: {
  artist: LibrarySnapshot["artists"][number];
}) {
  return (
    <form action={updateArtistAction}>
      <input type="hidden" name="artistId" value={artist.id} />
      <CardForm title="Edit artist" description="">
        <Input label="Artist name" name="name" defaultValue={artist.name} />
        <FormSubmitButton label="Save artist" pendingLabel="Saving..." variant="secondary" />
      </CardForm>
    </form>
  );
}

export function CreateSongForm({ artistId }: { artistId: string }) {
  return (
    <form action={createSongAction}>
      <input type="hidden" name="artistId" value={artistId} />
      <CardForm title="Add song" description="">
        <Input label="Song title" name="title" placeholder="Giant Steps" />
        <Input label="Goal tempo" name="goalTempo" type="number" min={1} placeholder="220" />
        <FormSubmitButton label="Create song" pendingLabel="Creating..." variant="accent" />
      </CardForm>
    </form>
  );
}

export function EditSongForm({
  song,
}: {
  song: NonNullable<LibrarySnapshot["artists"][number]["songs"]>[number];
}) {
  return (
    <form action={updateSongAction} className="section-panel p-4">
      <input type="hidden" name="songId" value={song.id} />
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="chip ">
          Goal {song.goal_tempo ? `${song.goal_tempo} BPM` : "unset"}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto] md:items-end">
        <Input label="Song" name="title" defaultValue={song.title} />
        <Input label="Goal tempo" name="goalTempo" defaultValue={song.goal_tempo} type="number" min={1} />
        <FormSubmitButton
          label="Save"
          pendingLabel="Saving..."
          className="btn btn-outline btn-sm md:mb-[0.35rem]"
        />
      </div>
    </form>
  );
}
