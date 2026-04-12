import { SessionsDashboard } from "@/components/sessions-dashboard";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getCurrentSession, getSessionById, listRecentSessions } from "@/lib/data/sessions";

export default async function SessionsPage() {
  const [librarySnapshot, recentSessions, currentSessionSummary] = await Promise.all([
    getLibrarySnapshot(),
    listRecentSessions(),
    getCurrentSession(),
  ]);

  const currentSession = currentSessionSummary
    ? await getSessionById(currentSessionSummary.id)
    : null;

  return (
    <SessionsDashboard
      currentSession={currentSession}
      librarySnapshot={librarySnapshot}
      recentSessions={recentSessions}
    />
  );
}
