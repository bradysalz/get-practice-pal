import { SetlistsDashboard } from "@/components/setlists-dashboard";
import { getLibrarySnapshot } from "@/lib/data/library";

export default async function SetlistsPage() {
  const snapshot = await getLibrarySnapshot();

  return <SetlistsDashboard snapshot={snapshot} />;
}
