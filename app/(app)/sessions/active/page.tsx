import { redirect } from "next/navigation";
import { ActiveSessionPage } from "@/components/sessions-dashboard";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getCurrentSession, getSessionById } from "@/lib/data/sessions";
import { getItemProgressSummaryMap } from "@/lib/data/stats";

export default async function ActiveSessionRoute() {
  const [librarySnapshot, currentSessionSummary] = await Promise.all([
    getLibrarySnapshot(),
    getCurrentSession(),
  ]);

  if (!currentSessionSummary) {
    redirect("/sessions");
  }

  const currentSession = await getSessionById(currentSessionSummary.id);
  const sessionItems = currentSession.session_items ?? [];
  const exerciseItems = sessionItems
    .filter((item): item is typeof item & { exercise_id: string } => item.item_type === "exercise" && Boolean(item.exercise_id))
    .map((item) => ({
      id: item.exercise_id,
      goalTempo: null,
    }));
  const songItems = sessionItems
    .filter((item): item is typeof item & { song_id: string } => item.item_type === "song" && Boolean(item.song_id))
    .map((item) => ({
      id: item.song_id,
      goalTempo: null,
    }));

  const [exerciseProgressMap, songProgressMap] = await Promise.all([
    getItemProgressSummaryMap({
      itemType: "exercise",
      items: exerciseItems,
      excludeSessionId: currentSession.id,
    }),
    getItemProgressSummaryMap({
      itemType: "song",
      items: songItems,
      excludeSessionId: currentSession.id,
    }),
  ]);

  return (
    <ActiveSessionPage
      currentSession={currentSession}
      librarySnapshot={librarySnapshot}
      exerciseProgressMap={exerciseProgressMap}
      songProgressMap={songProgressMap}
    />
  );
}
