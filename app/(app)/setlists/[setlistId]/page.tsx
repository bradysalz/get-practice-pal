import { notFound } from "next/navigation";
import { SetlistDetailPage } from "@/components/setlists-dashboard";
import { getLibrarySnapshot } from "@/lib/data/library";

export default async function SetlistPage({
  params,
}: {
  params: Promise<{ setlistId: string }>;
}) {
  const { setlistId } = await params;
  const snapshot = await getLibrarySnapshot();
  const setlist = snapshot.setlists.find((item) => item.id === setlistId);

  if (!setlist) {
    notFound();
  }

  return <SetlistDetailPage setlist={setlist} snapshot={snapshot} />;
}
