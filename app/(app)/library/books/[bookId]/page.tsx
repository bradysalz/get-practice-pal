import { notFound } from "next/navigation";
import { BookDetailPage } from "@/components/library-detail-pages";
import { getLibrarySnapshot } from "@/lib/data/library";
import { getBookCompletion, getItemProgressSummaryMap } from "@/lib/data/stats";

export default async function LibraryBookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const snapshot = await getLibrarySnapshot();
  const book = snapshot.books.find((item) => item.id === bookId);

  if (!book) {
    notFound();
  }

  const [bookCompletion, exerciseProgressMap] = await Promise.all([
    getBookCompletion(book.id),
    getItemProgressSummaryMap({
      itemType: "exercise",
      items: (book.sections ?? []).flatMap((section) =>
        (section.exercises ?? []).map((exercise) => ({
          id: exercise.id,
          goalTempo: exercise.goal_tempo,
        })),
      ),
    }),
  ]);

  const sectionProgressMap = new Map(
    (book.sections ?? []).map((section) => {
      const exercises = section.exercises ?? [];
      const totalExercisesWithGoals = exercises.filter((exercise) => exercise.goal_tempo).length;
      const completedExercises = exercises.filter((exercise) => exerciseProgressMap.get(exercise.id)?.completed).length;

      return [
        section.id,
        {
          totalExercisesWithGoals,
          completedExercises,
          completionRatio: totalExercisesWithGoals ? completedExercises / totalExercisesWithGoals : 0,
        },
      ] as const;
    }),
  );

  return <BookDetailPage book={book} bookCompletion={bookCompletion} sectionProgressMap={sectionProgressMap} />;
}
