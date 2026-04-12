import { LibraryManager } from "@/components/library-manager";
import { getLibrarySnapshot } from "@/lib/data/library";

export default async function LibraryPage() {
  const snapshot = await getLibrarySnapshot();

  return <LibraryManager snapshot={snapshot} />;
}
