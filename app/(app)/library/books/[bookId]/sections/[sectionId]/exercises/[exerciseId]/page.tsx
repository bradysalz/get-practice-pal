import { notFound } from "next/navigation";
import { ExerciseDetailPage } from "@/components/library-detail-pages";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getProgressToGoal } from "@/lib/data/stats";

export default async function LibraryExercisePage({
  params,
}: {
  params: Promise<{ bookId: string; sectionId: string; exerciseId: string }>;
}) {
  const { bookId, sectionId, exerciseId } = await params;
  const snapshot = await getLibrarySnapshot();
  const book = snapshot.books.find((item) => item.id === bookId);

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
    : null;

  return <ExerciseDetailPage book={book} section={section} exercise={exercise} itemProgress={itemProgress} />;
}
