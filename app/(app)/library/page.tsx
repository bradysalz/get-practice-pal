import { LibraryManager } from "@/components/library-manager";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getItemProgressSummaryMap } from "@/lib/data/stats";

export default async function LibraryPage() {
  const snapshot = await getLibrarySnapshot();
  const [exerciseProgressMap, songProgressMap] = await Promise.all([
    getItemProgressSummaryMap({
      itemType: "exercise",
      items: snapshot.books.flatMap((book) =>
        (book.sections ?? []).flatMap((section) =>
          (section.exercises ?? []).map((exercise) => ({
            id: exercise.id,
            goalTempo: exercise.goal_tempo,
          })),
        ),
      ),
    }),
    getItemProgressSummaryMap({
      itemType: "song",
      items: snapshot.artists.flatMap((artist) =>
        (artist.songs ?? []).map((song) => ({
          id: song.id,
          goalTempo: song.goal_tempo,
        })),
      ),
    }),
  ]);

  return (
    <LibraryManager
      snapshot={snapshot}
      exerciseProgressMap={exerciseProgressMap}
      songProgressMap={songProgressMap}
    />
  );
}
