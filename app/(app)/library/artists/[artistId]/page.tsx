import { notFound } from "next/navigation";
import { ArtistDetailPage } from "@/components/library-detail-pages";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getItemProgressSummaryMap } from "@/lib/data/stats";

export default async function LibraryArtistPage({
  params,
}: {
  params: Promise<{ artistId: string }>;
}) {
  const { artistId } = await params;
  const snapshot = await getLibrarySnapshot();
  const artist = snapshot.artists.find((item) => item.id === artistId);

  if (!artist) {
    notFound();
  }

  const songProgressMap = await getItemProgressSummaryMap({
    itemType: "song",
    items: (artist.songs ?? []).map((song) => ({
      id: song.id,
      goalTempo: song.goal_tempo,
    })),
  });

  return <ArtistDetailPage artist={artist} songProgressMap={songProgressMap} />;
}
