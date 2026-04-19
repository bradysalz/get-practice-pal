import { notFound } from "next/navigation";
import { SongDetailPage } from "@/components/library-detail-pages";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getProgressToGoal } from "@/lib/data/stats";

export default async function LibrarySongPage({
  params,
}: {
  params: Promise<{ artistId: string; songId: string }>;
}) {
  const { artistId, songId } = await params;
  const snapshot = await getLibrarySnapshot();
  const artist = snapshot.artists.find((item) => item.id === artistId);

  if (!artist) {
    notFound();
  }

  const song = artist.songs?.find((item) => item.id === songId);

  if (!song) {
    notFound();
  }

  const itemProgress = song.goal_tempo
    ? await getProgressToGoal({
        itemType: "song",
        songId: song.id,
        goalTempo: song.goal_tempo,
      })
    : null;

  return <SongDetailPage artist={artist} itemProgress={itemProgress} song={song} />;
}
