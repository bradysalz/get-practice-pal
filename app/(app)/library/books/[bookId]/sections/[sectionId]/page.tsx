import { notFound } from "next/navigation";
import { SectionDetailPage } from "@/components/library-detail-pages";
import { getBookById } from "@/lib/data/library";
import { getItemProgressSummaryMap } from "@/lib/data/stats";

export default async function LibrarySectionPage({
  params,
}: {
  params: Promise<{ bookId: string; sectionId: string }>;
}) {
  const { bookId, sectionId } = await params;
  const book = await getBookById(bookId);

  if (!book) {
    notFound();
  }

  const section = book.sections?.find((item) => item.id === sectionId);

  if (!section) {
    notFound();
  }

  const exerciseProgressMap = await getItemProgressSummaryMap({
    itemType: "exercise",
    items: (section.exercises ?? []).map((exercise) => ({
      id: exercise.id,
      goalTempo: exercise.goal_tempo,
    })),
  });

  return <SectionDetailPage book={book} section={section} exerciseProgressMap={exerciseProgressMap} />;
}
