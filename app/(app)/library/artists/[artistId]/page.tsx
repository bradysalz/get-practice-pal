import { notFound } from "next/navigation";
import { ArtistDetailPage } from "@/components/library-detail-pages";
import { getLibrarySnapshot } from "@/lib/data/library";

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

  return <ArtistDetailPage artist={artist} />;
}
