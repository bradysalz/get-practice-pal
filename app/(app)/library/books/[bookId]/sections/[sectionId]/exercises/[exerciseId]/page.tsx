import { notFound } from "next/navigation";
import { ExerciseDetailPage, resolveProgressRange } from "@/components/library-detail-pages";
import { getBookById } from "@/lib/data/library";
import { getItemTempoHistory } from "@/lib/data/stats";

export default async function LibraryExercisePage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string; sectionId: string; exerciseId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { bookId, sectionId, exerciseId } = await params;
  const { range } = await searchParams;
  const book = await getBookById(bookId);

  if (!book) {
    notFound();
  }

  const section = book.sections?.find((item) => item.id === sectionId);

  if (!section) {
    notFound();
  }

  const exercise = section.exercises?.find((item) => item.id === exerciseId);

  if (!exercise) {
    notFound();
  }

  const itemProgress = await getItemTempoHistory({
    itemType: "exercise",
    exerciseId: exercise.id,
  });
  const selectedRange = resolveProgressRange(itemProgress.entries, range);

  return <ExerciseDetailPage book={book} section={section} exercise={exercise} itemProgress={itemProgress} selectedRange={selectedRange} />;
}
