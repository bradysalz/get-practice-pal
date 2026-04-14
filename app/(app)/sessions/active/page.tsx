import { redirect } from "next/navigation";
import { ActiveSessionPage } from "@/components/sessions-dashboard";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getCurrentSession, getSessionById } from "@/lib/data/sessions";

export default async function ActiveSessionRoute() {
  const [librarySnapshot, currentSessionSummary] = await Promise.all([
    getLibrarySnapshot(),
    getCurrentSession(),
  ]);

  if (!currentSessionSummary) {
    redirect("/sessions");
  }

  const currentSession = await getSessionById(currentSessionSummary.id);

  return <ActiveSessionPage currentSession={currentSession} librarySnapshot={librarySnapshot} />;
}
