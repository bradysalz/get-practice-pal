import Link from "next/link";
import {
  reorderBookSectionsAction,
} from "@/app/(app)/library/actions";
import { ActionModal } from "@/components/action-modal";
import { ArtistHeroEditor } from "@/components/artist-hero-editor";
import { BookHeroEditor } from "@/components/book-hero-editor";
import { DraggableBookSections } from "@/components/draggable-book-sections";
import { ExerciseHeroEditor } from "@/components/exercise-hero-editor";
import { SectionHeroEditor } from "@/components/section-hero-editor";
import { SongHeroEditor } from "@/components/song-hero-editor";
import {
  EmptyState,
  PageHero,
  PagePanel,
  StatCard,
} from "@/components/ui/primitives";
import type { LibrarySnapshot } from "@/lib/data/library";
import type { TimeRange } from "@/lib/data/types";
import type { ItemProgressSummary } from "@/lib/data/stats";
import {
  CreateSongForm,
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
          <div className="grid grid-cols-3 gap-2 md:min-w-[26rem] md:gap-3">
            <StatCard compact label="Sections" value={String(sectionCount)} />
            <StatCard compact label="Exercises" value={String(exerciseCount)} />
            <StatCard
              compact
              label="Completion"
              value={`${Math.round(bookCompletion.completionRatio * 100)}%`}
            />
          </div>
        }
      >
        <BookHeroEditor
          bookId={book.id}
          composer={book.composer}
          externalBook={book.external_book}
          externalBookId={book.external_book_id}
          title={book.title}
        />
      </PageHero>

      <section className="space-y-6">
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
                        : "",
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

  return (
    <div className="space-y-6">
      <PageHero
        backHref="/library"
        backLabel="Back to library"
        eyebrow="Artist"
        title=""
        stats={
          <div className="grid grid-cols-1 gap-3 md:min-w-[12rem]">
            <StatCard label="Songs" value={String(songCount)} />
          </div>
        }
      >
        <ArtistHeroEditor artistId={artist.id} name={artist.name} />
      </PageHero>

      <section className="space-y-6">
        <PagePanel>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionHeader
              title="Songs"
            />
            <ActionModal triggerLabel="Add song" submitFormId="create-song-form" submitLabel="Save">
              <CreateSongForm artistId={artist.id} formId="create-song-form" surface="plain" />
            </ActionModal>
          </div>
          <div className="mt-5 space-y-3">
            {songCount ? (
              (artist.songs ?? []).map((song) => (
                <Link
                  key={song.id}
                  href={`/library/artists/${artist.id}/songs/${song.id}`}
                  className="block transition-all hover:shadow-[3px_3px_0_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                >
                  <SongProgressRow progress={songProgressMap.get(song.id)} song={song} />
                </Link>
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

export function SongDetailPage({
  artist,
  itemProgress,
  selectedRange,
  song,
}: {
  artist: LibrarySnapshot["artists"][number];
  itemProgress: TempoHistory;
  selectedRange: ProgressRange;
  song: NonNullable<LibrarySnapshot["artists"][number]["songs"]>[number];
}) {
  const filteredEntries = filterTempoEntries(itemProgress.entries, selectedRange);
  const rangeMaxTempo = filteredEntries.reduce((max, entry) => Math.max(max, entry.tempo), 0);
  const progressPercent = song.goal_tempo
    ? Math.min(Math.round((rangeMaxTempo / song.goal_tempo) * 100), 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHero
        backHref={`/library/artists/${artist.id}`}
        backLabel={
          <>
            Back to <em className="normal-case">{artist.name}</em>
          </>
        }
        eyebrow="Song"
        title=""
        stats={
          <div className="grid grid-cols-3 gap-3 md:min-w-[18rem]">
            <StatCard label="Goal" value={song.goal_tempo ? `${song.goal_tempo}` : "-"} />
            <StatCard label="Max" value={String(rangeMaxTempo)} />
            <StatCard label="Progress" value={song.goal_tempo ? `${progressPercent}%` : "-"} />
          </div>
        }
      >
        <SongHeroEditor
          artistId={artist.id}
          goalTempo={song.goal_tempo}
          songId={song.id}
          title={song.title}
        />
      </PageHero>

      <section className="space-y-6">
        <PagePanel>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionHeader title="Progress" />
            <ProgressRangeSelector
              currentRange={selectedRange}
              hrefBase={`/library/artists/${artist.id}/songs/${song.id}`}
            />
          </div>
          {filteredEntries.length ? (
            <div className="mt-5 space-y-4">
              <TempoProgressGraph entries={filteredEntries} goalTempo={song.goal_tempo} />
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState label="No progress yet." />
            </div>
          )}
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
  const completedExercises = exercises.filter((exercise) => exerciseProgressMap?.get(exercise.id)?.completed).length;
  const completionPercent = exercises.length ? Math.round((completedExercises / exercises.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHero
        backHref={`/library/books/${book.id}`}
        backLabel={
          <>
            Back to <em className="normal-case">{book.title}</em>
          </>
        }
        eyebrow="Section"
        title=""
        stats={
          section ? (
            <div className="grid grid-cols-2 gap-2 md:min-w-[14rem] md:gap-3">
              <StatCard compact label="Exercises" value={String(exercises.length)} />
              <StatCard compact label="Completion" value={`${completionPercent}%`} />
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
                        {exercise.goal_tempo ? <span className="chip">Goal {exercise.goal_tempo} BPM</span> : null}
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
  selectedRange,
}: {
  book: LibrarySnapshot["books"][number];
  section: NonNullable<LibrarySnapshot["books"][number]["sections"]>[number];
  exercise: NonNullable<NonNullable<LibrarySnapshot["books"][number]["sections"]>[number]["exercises"]>[number];
  itemProgress: TempoHistory;
  selectedRange: ProgressRange;
}) {
  const filteredEntries = filterTempoEntries(itemProgress.entries, selectedRange);
  const rangeMaxTempo = filteredEntries.reduce((max, entry) => Math.max(max, entry.tempo), 0);
  const progressPercent = exercise.goal_tempo
    ? Math.min(Math.round((rangeMaxTempo / exercise.goal_tempo) * 100), 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHero
        backHref={`/library/books/${book.id}/sections/${section.id}`}
        backLabel={
          <>
            Back to <em className="normal-case">{section.title}</em>
          </>
        }
        eyebrow="Exercise"
        title=""
        stats={
          <div className="grid grid-cols-3 gap-3 md:min-w-[18rem]">
            <StatCard label="Goal" value={exercise.goal_tempo ? `${exercise.goal_tempo}` : "-"} />
            <StatCard label="Max" value={String(rangeMaxTempo)} />
            <StatCard label="Progress" value={exercise.goal_tempo ? `${progressPercent}%` : "-"} />
          </div>
        }
      >
        <ExerciseHeroEditor
          bookId={book.id}
          exerciseId={exercise.id}
          goalTempo={exercise.goal_tempo}
          position={exercise.position}
          sectionId={section.id}
          title={exercise.title}
        />
      </PageHero>

      <section className="space-y-6">
        <PagePanel>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionHeader title="Progress" />
            <ProgressRangeSelector
              currentRange={selectedRange}
              hrefBase={`/library/books/${book.id}/sections/${section.id}/exercises/${exercise.id}`}
            />
          </div>
          {filteredEntries.length ? (
            <div className="mt-5 space-y-4">
              <TempoProgressGraph entries={filteredEntries} goalTempo={exercise.goal_tempo} />
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState label="No progress yet." />
            </div>
          )}
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
          {song.goal_tempo ? <span className="chip">Goal {song.goal_tempo} BPM</span> : null}
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

type TempoHistory = {
  currentMaxTempo: number;
  entries: Array<{
    recordedAt: string;
    tempo: number;
  }>;
};

type ProgressRange = Extract<TimeRange, "1m" | "1y" | "all">;

const PROGRESS_RANGE_OPTIONS: Array<{ label: string; value: ProgressRange }> = [
  { label: "Last month", value: "1m" },
  { label: "Last year", value: "1y" },
  { label: "All time", value: "all" },
];

function TempoProgressGraph({
  entries,
  goalTempo,
}: {
  entries: Array<{
    recordedAt: string;
    tempo: number;
  }>;
  goalTempo?: number | null;
}) {
  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 16, bottom: 34, left: 42 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxTempo = Math.max(goalTempo ?? 0, ...entries.map((entry) => entry.tempo));
  const tempoCeiling = Math.max(Math.ceil(maxTempo / 10) * 10, 10);
  const xStep = entries.length > 1 ? innerWidth / (entries.length - 1) : 0;
  const points = entries.map((entry, index) => {
    const x = padding.left + (entries.length > 1 ? index * xStep : innerWidth / 2);
    const y = padding.top + innerHeight - (entry.tempo / tempoCeiling) * innerHeight;

    return {
      ...entry,
      x,
      y,
    };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const goalY = goalTempo ? padding.top + innerHeight - (goalTempo / tempoCeiling) * innerHeight : null;
  const firstLabel = formatDate(entries[0].recordedAt);
  const lastLabel = formatDate(entries[entries.length - 1].recordedAt);

  return (
    <div className="space-y-3">
      <div className="rounded-[1.5rem] border border-base-300 bg-base-100/80 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Tempo progress over time">
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="currentColor" strokeOpacity="0.18" />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="currentColor"
            strokeOpacity="0.18"
          />
          {goalY != null ? (
            <line
              x1={padding.left}
              y1={goalY}
              x2={width - padding.right}
              y2={goalY}
              stroke="#b91c1c"
              strokeOpacity="0.85"
              strokeDasharray="8 8"
            />
          ) : null}
          <path
            d={linePath}
            fill="none"
            stroke="#dc2626"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="12 8"
          />
          <text x={padding.left - 10} y={padding.top + 4} textAnchor="end" fontSize="12" fill="currentColor" opacity="0.7">
            {tempoCeiling}
          </text>
          <text
            x={padding.left - 10}
            y={height - padding.bottom + 4}
            textAnchor="end"
            fontSize="12"
            fill="currentColor"
            opacity="0.7"
          >
            0
          </text>
        </svg>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-base-content/75">
        <span>{firstLabel}</span>
        <span className="font-medium text-base-content">Tempo</span>
        <span>{lastLabel}</span>
      </div>
      {goalTempo ? (
        <p className="text-sm text-base-content/75">Dashed line marks the goal tempo at {goalTempo} BPM.</p>
      ) : null}
    </div>
  );
}

function ProgressRangeSelector({
  currentRange,
  hrefBase,
}: {
  currentRange: ProgressRange;
  hrefBase: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROGRESS_RANGE_OPTIONS.map((option) => {
        const isActive = option.value === currentRange;

        return (
          <Link
            key={option.value}
            href={`${hrefBase}?range=${option.value}`}
            className={`chip transition-colors ${isActive ? "border-[#dc2626] bg-[#dc2626] text-white" : "chip-neutral"}`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

export function resolveProgressRange(entries: TempoHistory["entries"], requestedRange?: string): ProgressRange {
  if (requestedRange === "1m" || requestedRange === "1y" || requestedRange === "all") {
    return requestedRange;
  }

  if (!entries.length) {
    return "1m";
  }

  const oldestRecordedAt = new Date(entries[0].recordedAt).getTime();
  const oneMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()).getTime();
  const oneYearStart = new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()).getTime();

  if (oldestRecordedAt >= oneMonthStart) {
    return "1m";
  }

  if (oldestRecordedAt >= oneYearStart) {
    return "1y";
  }

  return "all";
}

function filterTempoEntries(entries: TempoHistory["entries"], range: ProgressRange) {
  if (range === "all") {
    return entries;
  }

  const cutoff = range === "1m"
    ? new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()).getTime()
    : new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()).getTime();

  return entries.filter((entry) => new Date(entry.recordedAt).getTime() >= cutoff);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
