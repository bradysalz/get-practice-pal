import { notFound } from "next/navigation";
import { ExerciseDetailPage } from "@/components/library-detail-pages";
import { getBookById } from "@/lib/data/library";
import { getItemTempoHistory, getProgressToGoal } from "@/lib/data/stats";

export default async function LibraryExercisePage({
  params,
}: {
  params: Promise<{ bookId: string; sectionId: string; exerciseId: string }>;
}) {
  const { bookId, sectionId, exerciseId } = await params;
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

  const itemProgress = exercise.goal_tempo
    ? await getProgressToGoal({
        itemType: "exercise",
        exerciseId: exercise.id,
        goalTempo: exercise.goal_tempo,
      })
    : await getItemTempoHistory({
        itemType: "exercise",
        exerciseId: exercise.id,
      });

  return <ExerciseDetailPage book={book} section={section} exercise={exercise} itemProgress={itemProgress} />;
}
