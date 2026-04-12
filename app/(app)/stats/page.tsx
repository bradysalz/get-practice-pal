import { StatsDashboard } from "@/components/stats-dashboard";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getBookCompletion, getProgressToGoal } from "@/lib/data/stats";

type StatsPageProps = {
  searchParams?: Promise<{
    book?: string;
    item?: string;
    range?: "1w" | "1m" | "6m" | "1y" | "all";
  }>;
};

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const params = (await searchParams) ?? {};
  const range = params.range ?? "all";
  const snapshot = await getLibrarySnapshot();

  const selectedItemKey = params.item;
  const selectedBookId = params.book;

  const goalLookup = new Map<string, number>();

  for (const book of snapshot.books) {
    for (const section of book.sections ?? []) {
      for (const exercise of section.exercises ?? []) {
        if (exercise.goal_tempo) {
          goalLookup.set(`exercise:${exercise.id}`, exercise.goal_tempo);
        }
      }
    }
  }

  for (const artist of snapshot.artists) {
    for (const song of artist.songs ?? []) {
      if (song.goal_tempo) {
        goalLookup.set(`song:${song.id}`, song.goal_tempo);
      }
    }
  }

  const itemProgress =
    selectedItemKey && goalLookup.has(selectedItemKey)
      ? await getProgressToGoal({
          itemType: selectedItemKey.startsWith("song:") ? "song" : "exercise",
          songId: selectedItemKey.startsWith("song:") ? selectedItemKey.split(":")[1] : null,
          exerciseId: selectedItemKey.startsWith("exercise:") ? selectedItemKey.split(":")[1] : null,
          goalTempo: goalLookup.get(selectedItemKey) ?? 0,
          range,
        })
      : null;

  const bookCompletion = selectedBookId ? await getBookCompletion(selectedBookId, range) : null;

  return (
    <StatsDashboard
      snapshot={snapshot}
      selectedBookId={selectedBookId}
      selectedItemKey={selectedItemKey}
      selectedRange={range}
      bookCompletion={bookCompletion}
      itemProgress={itemProgress}
    />
  );
}
