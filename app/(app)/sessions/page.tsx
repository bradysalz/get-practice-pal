import { redirect } from "next/navigation";
import { SessionsDashboard } from "@/components/sessions-dashboard";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getCurrentSession, listRecentSessions } from "@/lib/data/sessions";

export default async function SessionsPage() {
  const [librarySnapshot, recentSessions, currentSessionSummary] = await Promise.all([
    getLibrarySnapshot(),
    listRecentSessions(),
    getCurrentSession(),
  ]);

  if (currentSessionSummary) {
    redirect("/sessions/active");
  }

  return (
    <SessionsDashboard
      librarySnapshot={librarySnapshot}
      recentSessions={recentSessions}
    />
  );
}
