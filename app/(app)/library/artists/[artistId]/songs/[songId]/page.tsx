import { notFound } from "next/navigation";
import { resolveProgressRange, SongDetailPage } from "@/components/library-detail-pages";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getItemTempoHistory } from "@/lib/data/stats";

export default async function LibrarySongPage({
  params,
  searchParams,
}: {
  params: Promise<{ artistId: string; songId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { artistId, songId } = await params;
  const { range } = await searchParams;
  const snapshot = await getLibrarySnapshot();
  const artist = snapshot.artists.find((item) => item.id === artistId);

  if (!artist) {
    notFound();
  }

  const song = artist.songs?.find((item) => item.id === songId);

  if (!song) {
    notFound();
  }

  const itemProgress = await getItemTempoHistory({
    itemType: "song",
    songId: song.id,
  });
  const selectedRange = resolveProgressRange(itemProgress.entries, range);

  return <SongDetailPage artist={artist} itemProgress={itemProgress} selectedRange={selectedRange} song={song} />;
}
