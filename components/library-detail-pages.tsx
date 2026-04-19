import Link from "next/link";
import {
  deleteExerciseAction,
  reorderBookSectionsAction,
  updateArtistAction,
} from "@/app/(app)/library/actions";
import { BookHeroEditor } from "@/components/book-hero-editor";
import { DraggableBookSections } from "@/components/draggable-book-sections";
import { SectionHeroEditor } from "@/components/section-hero-editor";
import { FormSubmitButton } from "@/components/form-submit-button";
import {
  EmptyState,
  PageHero,
  PagePanel,
  StatCard,
  TextInput,
} from "@/components/ui/primitives";
import type { LibrarySnapshot } from "@/lib/data/library";
import type { ItemProgressSummary } from "@/lib/data/stats";
import {
  CreateSongForm,
  EditExerciseForm,
  EditSongForm,
  SectionHeader,
} from "@/components/library-manager";

export function BookDetailPage({
  book,
  bookCompletion,
  sectionProgressMap,
}: {
  book: LibrarySnapshot["books"][number];
  bookCompletion: {
    totalExercisesWithGoals: number;
    completedExercises: number;
    completionRatio: number;
  };
  sectionProgressMap: Map<
    string,
    {
      totalExercisesWithGoals: number;
      completedExercises: number;
      completionRatio: number;
    }
  >;
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
        title=""
        stats={
          <div className="grid grid-cols-2 gap-3 md:min-w-[18rem]">
            <StatCard label="Sections" value={String(sectionCount)} />
            <StatCard label="Exercises" value={String(exerciseCount)} />
          </div>
        }
      >
        <BookHeroEditor
          bookId={book.id}
          composer={book.composer}
          externalBookId={book.external_book_id}
          title={book.title}
        />
      </PageHero>

      <section className="space-y-6">
        <PagePanel>
          <SectionHeader title="Progress" />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <StatCard
              label="Exercises with goals"
              value={String(bookCompletion.totalExercisesWithGoals)}
            />
            <StatCard label="Completed" value={String(bookCompletion.completedExercises)} />
            <StatCard
              label="Completion"
              value={`${Math.round(bookCompletion.completionRatio * 100)}%`}
            />
          </div>
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
                    completionLabel:
                      sectionProgressMap.get(section.id)?.totalExercisesWithGoals
                        ? `${sectionProgressMap.get(section.id)?.completedExercises ?? 0}/${sectionProgressMap.get(section.id)?.totalExercisesWithGoals ?? 0} complete`
                        : "No goals yet",
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
  songProgressMap,
}: {
  artist: LibrarySnapshot["artists"][number];
  songProgressMap: Map<string, ItemProgressSummary>;
}) {
  const songCount = artist.songs?.length ?? 0;
  const songsWithGoals = (artist.songs ?? []).filter((song) => song.goal_tempo).length;
  const completedSongs = (artist.songs ?? []).filter((song) => songProgressMap.get(song.id)?.completed).length;

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
          <SectionHeader title="Progress" />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <StatCard label="Songs with goals" value={String(songsWithGoals)} />
            <StatCard label="Completed" value={String(completedSongs)} />
            <StatCard
              label="Tracked"
              value={String((artist.songs ?? []).filter((song) => (songProgressMap.get(song.id)?.entryCount ?? 0) > 0).length)}
            />
          </div>
        </PagePanel>

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
              (artist.songs ?? []).map((song) => (
                <div key={song.id} className="space-y-3">
                  <SongProgressRow progress={songProgressMap.get(song.id)} song={song} />
                  <EditSongForm song={song} />
                </div>
              ))
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
  exerciseProgressMap,
}: {
  book: LibrarySnapshot["books"][number];
  section?: NonNullable<LibrarySnapshot["books"][number]["sections"]>[number];
  exerciseProgressMap?: Map<string, ItemProgressSummary>;
}) {
  const exercises = section?.exercises ?? [];
  const exercisesWithGoals = exercises.filter((exercise) => exercise.goal_tempo).length;
  const completedExercises = exercises.filter((exercise) => exerciseProgressMap?.get(exercise.id)?.completed).length;

  return (
    <div className="space-y-6">
      <PageHero
        backHref={`/library/books/${book.id}`}
        backLabel={`Back to ${book.title}`}
        eyebrow="Section"
        title=""
        stats={
          section ? (
            <div className="grid grid-cols-3 gap-3 md:min-w-[18rem]">
              <StatCard label="Exercises" value={String(exercises.length)} />
              <StatCard label="Goals" value={String(exercisesWithGoals)} />
              <StatCard label="Completed" value={String(completedExercises)} />
            </div>
          ) : undefined
        }
      >
        <SectionHeroEditor
          bookId={book.id}
          section={section}
          title={section ? section.title : "New section"}
        />
      </PageHero>

      <section className="space-y-6">
        {section ? (
          <PagePanel>
            <SectionHeader
              title="Current Exercises"
            />
            <div className="mt-5 space-y-3">
              {section.exercises?.length ? (
                section.exercises.map((exercise) => (
                  <Link
                    key={exercise.id}
                    href={`/library/books/${book.id}/sections/${section.id}/exercises/${exercise.id}`}
                    className="list-row block p-4 transition-all hover:shadow-[3px_3px_0_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium text-base-content">{exercise.title}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="chip">
                          Goal {exercise.goal_tempo ? `${exercise.goal_tempo} BPM` : "unset"}
                        </span>
                        <span className="chip chip-neutral">
                          Max {exerciseProgressMap?.get(exercise.id)?.currentMaxTempo ?? 0} BPM
                        </span>
                      </div>
                    </div>
                  </Link>
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

export function ExerciseDetailPage({
  book,
  section,
  exercise,
  itemProgress,
}: {
  book: LibrarySnapshot["books"][number];
  section: NonNullable<LibrarySnapshot["books"][number]["sections"]>[number];
  exercise: NonNullable<NonNullable<LibrarySnapshot["books"][number]["sections"]>[number]["exercises"]>[number];
  itemProgress: {
    currentMaxTempo: number;
    goalTempo: number;
    progress: Array<{
      recordedAt: string;
      maxTempo: number;
      progressRatio: number;
    }>;
  } | null;
}) {
  const progressPercent = itemProgress ? Math.min(Math.round((itemProgress.currentMaxTempo / itemProgress.goalTempo) * 100), 100) : 0;

  return (
    <div className="space-y-6">
      <PageHero
        backHref={`/library/books/${book.id}/sections/${section.id}`}
        backLabel={`Back to ${section.title}`}
        eyebrow="Exercise"
        title={exercise.title}
        stats={
          <div className="grid grid-cols-3 gap-3 md:min-w-[18rem]">
            <StatCard label="Goal" value={exercise.goal_tempo ? `${exercise.goal_tempo}` : "0"} />
            <StatCard label="Max" value={String(itemProgress?.currentMaxTempo ?? 0)} />
            <StatCard label="Progress" value={`${progressPercent}%`} />
          </div>
        }
      >
        <p className="text-base-content/70">{book.title} / {section.title}</p>
      </PageHero>

      <section className="space-y-6">
        <PagePanel>
          <EditExerciseForm exercise={exercise} inheritedTempo={section.default_goal_tempo} />
        </PagePanel>

        <PagePanel>
          <SectionHeader title="Progress" />
          {itemProgress ? (
            <div className="mt-5 space-y-4">
              <progress className="progress progress-primary w-full" value={progressPercent} max={100} />
              <div className="space-y-3">
                {itemProgress.progress.length ? (
                  itemProgress.progress.map((point) => (
                    <div key={`${point.recordedAt}-${point.maxTempo}`} className="list-row p-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-base-content/75">{formatDate(point.recordedAt)}</span>
                        <span className="font-medium text-base-content">{point.maxTempo} BPM</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState label="No progress yet." className="mt-4" />
                )}
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState label="Set a goal tempo to track progress." />
            </div>
          )}
        </PagePanel>

        <PagePanel>
          <SectionHeader title="Danger zone" />
          <form action={deleteExerciseAction} className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <input type="hidden" name="exerciseId" value={exercise.id} />
            <input type="hidden" name="bookId" value={book.id} />
            <input type="hidden" name="sectionId" value={section.id} />
            <p className="text-sm text-base-content/70">Delete this exercise and return to the section.</p>
            <button
              type="submit"
              className="btn border-[#0a0a0a] bg-[#991b1b] text-white hover:border-[#0a0a0a] hover:bg-[#991b1b] hover:text-white"
            >
              <span aria-hidden="true">🗑</span>
              <span>Delete exercise</span>
            </button>
          </form>
        </PagePanel>
      </section>
    </div>
  );
}

function SongProgressRow({
  progress,
  song,
}: {
  progress: ItemProgressSummary | undefined;
  song: NonNullable<LibrarySnapshot["artists"][number]["songs"]>[number];
}) {
  return (
    <div className="list-row p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium text-base-content">{song.title}</p>
        <div className="flex flex-wrap gap-2">
          <span className="chip">Goal {song.goal_tempo ? `${song.goal_tempo} BPM` : "unset"}</span>
          <span className="chip chip-neutral">Max {progress?.currentMaxTempo ?? 0} BPM</span>
        </div>
      </div>
      {song.goal_tempo ? (
        <progress
          className="progress progress-primary mt-3 w-full"
          value={Math.min(Math.round((progress?.completionRatio ?? 0) * 100), 100)}
          max={100}
        />
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
