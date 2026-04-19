import type { ReactNode } from "react";
import {
  createArtistAction,
  createBookAction,
  createExerciseAction,
  createSectionAction,
  createSongAction,
  deleteExerciseAction,
  deleteSongAction,
  updateArtistAction,
  updateBookAction,
  updateExerciseAction,
  updateSectionAction,
  updateSongAction,
} from "@/app/(app)/library/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { FormSubmitButton } from "@/components/form-submit-button";
import { ActionModal } from "@/components/action-modal";
import { BookMetadataSearch } from "@/components/book-metadata-search";
import {
  linkedBookAuthors,
  linkedBookCoverUrl,
  linkedBookPublishedYear,
  resolveLinkedBook,
} from "@/components/linked-book-metadata";
import {
  CardLink,
  EmptyState,
  Field,
  FormActions,
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
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Library"
        title=""
      />

      <section className="space-y-6">
        <div className="space-y-6">
          <PagePanel>
            <SectionTitle
              title="Books"
              actions={
                <ActionModal triggerLabel="Add book" submitFormId="create-book-form" submitLabel="Save">
                  <CreateBookForm />
                </ActionModal>
              }
            />
            <div className="mt-5">
              {snapshot.books.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {snapshot.books.map((book) => {
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
                            <p className="mt-2 text-sm text-base-content/65">
                              {displayAuthor || "No composer set"}
                              {publishedYear ? ` · ${publishedYear}` : ""}
                            </p>
                            <div className="mt-auto flex flex-wrap gap-2 pt-4">
                              <span className="chip chip-neutral ">
                                {sectionCount} section{sectionCount === 1 ? "" : "s"}
                              </span>
                              <span className="chip chip-neutral ">
                                {bookExerciseCount} exercise{bookExerciseCount === 1 ? "" : "s"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardLink>
                    );
                  })}
                </div>
              ) : (
                <EmptyState label="No books yet." />
              )}
            </div>
          </PagePanel>

          <PagePanel>
            <SectionTitle
              title="Artists"
              actions={
                <ActionModal triggerLabel="Add artist" submitFormId="create-artist-form" submitLabel="Save">
                  <CreateArtistForm />
                </ActionModal>
              }
            />
            <div className="mt-5">
              {snapshot.artists.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {snapshot.artists.map((artist) => {
                    const artistSongCount = artist.songs?.length ?? 0;

                    return (
                      <CardLink key={artist.id} href={`/library/artists/${artist.id}`} className="h-full">
                        <div className="flex h-full flex-col">
                          <h2 className="text-lg font-bold leading-tight text-base-content">{artist.name}</h2>
                          <div className="mt-auto flex flex-wrap gap-2 pt-4">
                            <span className="chip chip-neutral ">
                              {artistSongCount} song{artistSongCount === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>
                      </CardLink>
                    );
                  })}
                </div>
              ) : (
                <EmptyState label="No artists yet." />
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
  surface = "card",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  surface?: "card" | "plain";
}) {
  return (
    <div className={surface === "card" ? "accent-card p-4" : ""}>
      {title ? <h3 className="text-lg font-bold text-primary">{title}</h3> : null}
      {description ? (
        <p className="mt-2 text-sm leading-6 text-base-content/70">{description}</p>
      ) : null}
      <div className={title || description ? "mt-4 space-y-4" : "space-y-4"}>{children}</div>
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
    <form id="create-book-form" action={createBookAction}>
      <CardForm surface="plain">
        <Input label="Title" name="title" placeholder="Stick Control" />
        <Input label="Composer" name="composer" placeholder="George Lawrence Stone" />
        <BookMetadataSearch />
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
        <BookMetadataSearch
          author={book.composer}
          initialExternalBook={book.external_book}
          initialExternalBookId={book.external_book_id}
          title={book.title}
        />
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
        title="New section"
      >
        <Input label="Title" name="title" placeholder="Triplet Grid" />
        <Input
          label="Default tempo"
          name="defaultGoalTempo"
          type="number"
          min={1}
          placeholder="132"
        />
        <FormActions>
          <FormSubmitButton label="Save" pendingLabel="Saving..." variant="accent" />
        </FormActions>
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
        title="New exercise"
      >
        <Input label="Title" name="title" placeholder="Exercise 1" />
        <Input
          label="Goal tempo"
          name="goalTempo"
          type="number"
          min={1}
          placeholder="Override if needed"
        />
        <FormActions>
          <FormSubmitButton label="Save" pendingLabel="Saving..." variant="accent" />
        </FormActions>
      </CardForm>
    </form>
  );
}

export function EditExerciseForm({
  bookId,
  exercise,
  inheritedTempo,
  sectionId,
}: {
  bookId: string;
  exercise: NonNullable<
    NonNullable<LibrarySnapshot["books"][number]["sections"]>[number]["exercises"]
  >[number];
  inheritedTempo: number | null;
  sectionId: string;
}) {
  return (
    <div className="section-panel p-4">
      <form action={updateExerciseAction}>
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
      <form action={deleteExerciseAction} className="mt-4">
        <input type="hidden" name="exerciseId" value={exercise.id} />
        <input type="hidden" name="bookId" value={bookId} />
        <input type="hidden" name="sectionId" value={sectionId} />
        <ConfirmSubmitButton
          className="btn btn-outline btn-sm"
          confirmMessage={`Delete "${exercise.title}"? This cannot be undone.`}
          label="Delete exercise"
        />
      </form>
    </div>
  );
}

export function CreateArtistForm() {
  return (
    <form id="create-artist-form" action={createArtistAction}>
      <CardForm surface="plain">
        <Input label="Name" name="name" placeholder="John Coltrane" />
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
      <CardForm title="New song">
        <Input label="Title" name="title" placeholder="Giant Steps" />
        <Input label="Goal tempo" name="goalTempo" type="number" min={1} placeholder="220" />
        <FormActions>
          <FormSubmitButton label="Save" pendingLabel="Saving..." variant="accent" />
        </FormActions>
      </CardForm>
    </form>
  );
}

export function EditSongForm({
  artistId,
  song,
}: {
  artistId: string;
  song: NonNullable<LibrarySnapshot["artists"][number]["songs"]>[number];
}) {
  return (
    <div className="section-panel p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="chip ">
          Goal {song.goal_tempo ? `${song.goal_tempo} BPM` : "unset"}
        </span>
      </div>
      <form action={updateSongAction}>
        <input type="hidden" name="songId" value={song.id} />
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
      <form action={deleteSongAction} className="mt-4">
        <input type="hidden" name="songId" value={song.id} />
        <input type="hidden" name="artistId" value={artistId} />
        <ConfirmSubmitButton
          className="btn btn-outline btn-sm"
          confirmMessage={`Delete "${song.title}"? This cannot be undone.`}
          label="Delete song"
        />
      </form>
    </div>
  );
}
