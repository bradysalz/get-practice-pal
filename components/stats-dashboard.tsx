import type { LibrarySnapshot } from "@/lib/data/library";
import { FormSelect } from "@/components/form-select";
import { EmptyState, PageHero, PagePanel, StatCard } from "@/components/ui/primitives";
import { buildLibraryItemMaps } from "@/lib/data/view-models";

type StatsDashboardProps = {
  snapshot: LibrarySnapshot;
  selectedBookId?: string;
  selectedItemKey?: string;
  selectedRange: "1w" | "1m" | "6m" | "1y" | "all";
  bookCompletion:
    | {
        totalExercisesWithGoals: number;
        completedExercises: number;
        completionRatio: number;
      }
    | null;
  itemProgress:
    | {
        currentMaxTempo: number;
        goalTempo: number;
        progress: Array<{
          recordedAt: string;
          maxTempo: number;
          progressRatio: number;
        }>;
      }
    | null;
};

const ranges = [
  { value: "1w", label: "1 week" },
  { value: "1m", label: "1 month" },
  { value: "6m", label: "6 months" },
  { value: "1y", label: "1 year" },
  { value: "all", label: "All time" },
] as const;

export function StatsDashboard({
  snapshot,
  selectedBookId,
  selectedItemKey,
  selectedRange,
  bookCompletion,
  itemProgress,
}: StatsDashboardProps) {
  const itemMaps = buildLibraryItemMaps(snapshot);
  const itemOptions = [
    ...Array.from(itemMaps.exerciseMap.entries()).map(([id, item]) => ({
      value: `exercise:${id}`,
      label: item.label,
    })),
    ...Array.from(itemMaps.songMap.entries()).map(([id, item]) => ({
      value: `song:${id}`,
      label: item.label,
    })),
  ].sort((left, right) => left.label.localeCompare(right.label));

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Stats"
        title="See what is improving."
        stats={
          <div className="soft-stat px-5 py-4 text-sm text-base-content/75">
            {snapshot.books.length} books · {snapshot.artists.length} artists
          </div>
        }
      />

      <section className="space-y-6">
        <PagePanel>
          <h2 className="font-display text-xl font-semibold text-base-content">Progress to goal tempo</h2>
          <form className="mt-5 grid gap-3 md:grid-cols-[1.2fr_0.6fr_auto] md:items-end">
            <FormSelect
              label="Exercise or song"
              name="item"
              defaultValue={selectedItemKey ?? ""}
              emptyLabel="Select an item"
              options={itemOptions}
            />
            <FormSelect
              label="Range"
              name="range"
              defaultValue={selectedRange}
              options={ranges.map((range) => ({ value: range.value, label: range.label }))}
            />
            <button className="btn btn-primary btn-sm">Show progress</button>
          </form>

          {itemProgress ? (
            <div className="mt-6 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <StatCard label="Current max tempo" value={`${itemProgress.currentMaxTempo} BPM`} />
                <StatCard label="Goal tempo" value={`${itemProgress.goalTempo} BPM`} />
              </div>
              <div className="space-y-3">
                {itemProgress.progress.length ? (
                  itemProgress.progress.map((point) => (
                    <div key={`${point.recordedAt}-${point.maxTempo}`} className="list-row p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-base-content/75">{formatDate(point.recordedAt)}</span>
                          <span className="font-medium text-base-content">{point.maxTempo} BPM</span>
                        </div>
                        <progress
                          className="progress progress-primary w-full"
                          value={Math.min(point.progressRatio * 100, 100)}
                          max={100}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState label="No progress points found in the selected range." />
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState label="Choose an exercise or song to see progress." />
            </div>
          )}
        </PagePanel>

        <PagePanel>
          <h2 className="font-display text-xl font-semibold text-base-content">Book completion</h2>
          <form className="mt-5 grid gap-3 md:grid-cols-[1.2fr_0.6fr_auto] md:items-end">
            <FormSelect
              label="Book"
              name="book"
              defaultValue={selectedBookId ?? ""}
              emptyLabel="Select a book"
              options={snapshot.books.map((book) => ({ value: book.id, label: book.title }))}
            />
            <FormSelect
              label="Range"
              name="range"
              defaultValue={selectedRange}
              options={ranges.map((range) => ({ value: range.value, label: range.label }))}
            />
            <button className="btn btn-primary btn-sm">Show completion</button>
          </form>

          {bookCompletion ? (
            <div className="mt-6 space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <StatCard label="Exercises with goals" value={String(bookCompletion.totalExercisesWithGoals)} />
                <StatCard label="Completed" value={String(bookCompletion.completedExercises)} />
                <StatCard
                  label="Completion"
                  value={`${Math.round(bookCompletion.completionRatio * 100)}%`}
                />
              </div>
              <progress
                className="progress progress-secondary w-full"
                value={Math.round(bookCompletion.completionRatio * 100)}
                max={100}
              />
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState label="Choose a book to see completion." />
            </div>
          )}
        </PagePanel>
      </section>
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
