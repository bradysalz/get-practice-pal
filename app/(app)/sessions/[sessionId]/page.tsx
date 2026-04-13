import { notFound } from "next/navigation";
import { SessionDetailPage } from "@/components/session-detail-page";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getSessionById } from "@/lib/data/sessions";

type SessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;

  const [snapshot, session] = await Promise.all([
    getLibrarySnapshot(),
    getSessionById(sessionId).catch(() => null),
  ]);

  if (!session) {
    notFound();
  }

  return <SessionDetailPage session={session} snapshot={snapshot} />;
}
