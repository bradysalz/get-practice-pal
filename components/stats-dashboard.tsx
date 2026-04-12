import Link from "next/link";
import type { LibrarySnapshot } from "@/lib/data/library";
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
      <section className="rounded-[2rem] border border-base-300/70 bg-base-100/85 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">Stats</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              See what is actually improving.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-base-content/75 md:text-base">
              Stats now read from the live backend. Choose an exercise or song for progress-to-goal, or a
              book to measure how much of it has crossed its target tempos.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-base-200/70 px-5 py-4 text-sm text-base-content/75">
            {snapshot.books.length} books · {snapshot.artists.length} artists
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-base-300/70 bg-base-100/85 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-base-content">Progress to goal tempo</h2>
            <form className="mt-5 grid gap-3 md:grid-cols-[1.2fr_0.6fr_auto] md:items-end">
              <label className="form-control w-full">
                <span className="label-text mb-2 text-sm font-medium text-base-content">Exercise or song</span>
                <select className="select select-bordered w-full" name="item" defaultValue={selectedItemKey ?? ""}>
                  <option value="">Select an item</option>
                  {itemOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-2 text-sm font-medium text-base-content">Range</span>
                <select className="select select-bordered w-full" name="range" defaultValue={selectedRange}>
                  {ranges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </label>
              <button className="btn btn-primary">Show progress</button>
            </form>

            {itemProgress ? (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <StatCard label="Current max tempo" value={`${itemProgress.currentMaxTempo} BPM`} />
                  <StatCard label="Goal tempo" value={`${itemProgress.goalTempo} BPM`} />
                </div>
                <div className="rounded-[1.25rem] bg-base-200/55 p-4">
                  <p className="text-sm font-medium text-base-content">Progress points</p>
                  <div className="mt-4 space-y-3">
                    {itemProgress.progress.length ? (
                      itemProgress.progress.map((point) => (
                        <div key={`${point.recordedAt}-${point.maxTempo}`} className="space-y-2">
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
                      ))
                    ) : (
                      <EmptyBox label="No progress points found in the selected range." />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <EmptyBox label="Choose an exercise or song to view progress toward its goal tempo." />
              </div>
            )}
          </section>

          <section className="rounded-[1.75rem] border border-base-300/70 bg-base-100/85 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-base-content">Book completion</h2>
            <form className="mt-5 grid gap-3 md:grid-cols-[1.2fr_0.6fr_auto] md:items-end">
              <label className="form-control w-full">
                <span className="label-text mb-2 text-sm font-medium text-base-content">Book</span>
                <select className="select select-bordered w-full" name="book" defaultValue={selectedBookId ?? ""}>
                  <option value="">Select a book</option>
                  {snapshot.books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-2 text-sm font-medium text-base-content">Range</span>
                <select className="select select-bordered w-full" name="range" defaultValue={selectedRange}>
                  {ranges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </label>
              <button className="btn btn-primary">Show completion</button>
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
                <EmptyBox label="Choose a book to see how many exercises have reached their goal tempos." />
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-base-300/70 bg-base-100/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-base-content">Data source</h2>
            <p className="mt-3 text-sm leading-6 text-base-content/75">
              These stats read from recorded session items. If you do not see useful output yet, log material
              in <Link href="/sessions" className="link">Sessions</Link> and define goal tempos in
              <Link href="/library" className="link ml-1">Library</Link>.
            </p>
          </section>
        </div>
      </section>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-base-200/70 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-base-content">{value}</p>
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
