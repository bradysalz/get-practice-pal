import { requireSupabaseClient, requireUser } from "@/lib/auth/session";
import type { PracticeItemType, TimeRange } from "@/lib/data/types";
import { assertPracticeItemReference, getRangeStart } from "@/lib/data/validators";

type RawTempoEntry = {
  tempo: number;
  created_at: string;
  practice_sessions?: {
    started_at: string;
  }[] | null;
};

export async function getItemTempoHistory(input: {
  itemType: PracticeItemType;
  exerciseId?: string | null;
  songId?: string | null;
  range?: TimeRange;
}) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const rangeStart = getRangeStart(input.range ?? "all");

  assertPracticeItemReference(input);

  let query = client
    .from("practice_session_items")
    .select("tempo, created_at, practice_sessions(started_at)")
    .eq("user_id", user.id)
    .eq("item_type", input.itemType)
    .order("created_at", { ascending: true });

  query =
    input.itemType === "exercise"
      ? query.eq("exercise_id", input.exerciseId ?? "")
      : query.eq("song_id", input.songId ?? "");

  if (rangeStart) {
    query = query.gte("created_at", rangeStart.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;

  const entries = ((data ?? []) as unknown as RawTempoEntry[]).map((entry) => ({
    tempo: entry.tempo,
    recordedAt: entry.practice_sessions?.[0]?.started_at ?? entry.created_at,
  }));

  return {
    entries,
    currentMaxTempo: entries.reduce((max, entry) => Math.max(max, entry.tempo), 0),
  };
}

export async function getProgressToGoal(input: {
  itemType: PracticeItemType;
  exerciseId?: string | null;
  songId?: string | null;
  goalTempo: number;
  range?: TimeRange;
}) {
  const history = await getItemTempoHistory(input);
  let runningMax = 0;

  const progress = history.entries.map((entry) => {
    runningMax = Math.max(runningMax, entry.tempo);

    return {
      recordedAt: entry.recordedAt,
      maxTempo: runningMax,
      progressRatio: input.goalTempo > 0 ? runningMax / input.goalTempo : 0,
    };
  });

  return {
    currentMaxTempo: history.currentMaxTempo,
    goalTempo: input.goalTempo,
    progress,
  };
}

export async function getBookCompletion(bookId: string, range: TimeRange = "all") {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const rangeStart = getRangeStart(range);

  const exercises = await client
    .from("exercises")
    .select("id, goal_tempo, section:book_sections!inner(book_id)")
    .eq("user_id", user.id)
    .eq("book_sections.book_id", bookId)
    .not("goal_tempo", "is", null);

  if (exercises.error) throw exercises.error;

  const exerciseIds = (exercises.data ?? []).map((exercise) => exercise.id);

  if (!exerciseIds.length) {
    return {
      totalExercisesWithGoals: 0,
      completedExercises: 0,
      completionRatio: 0,
    };
  }

  let itemQuery = client
    .from("practice_session_items")
    .select("exercise_id, tempo")
    .eq("user_id", user.id)
    .eq("item_type", "exercise")
    .in("exercise_id", exerciseIds);

  if (rangeStart) {
    itemQuery = itemQuery.gte("created_at", rangeStart.toISOString());
  }

  const items = await itemQuery;

  if (items.error) throw items.error;

  const maxByExercise = new Map<string, number>();

  for (const item of items.data ?? []) {
    if (!item.exercise_id) {
      continue;
    }

    maxByExercise.set(
      item.exercise_id,
      Math.max(maxByExercise.get(item.exercise_id) ?? 0, item.tempo),
    );
  }

  const completedExercises = (exercises.data ?? []).filter((exercise) => {
    if (!exercise.goal_tempo) {
      return false;
    }

    return (maxByExercise.get(exercise.id) ?? 0) >= exercise.goal_tempo;
  }).length;

  return {
    totalExercisesWithGoals: exerciseIds.length,
    completedExercises,
    completionRatio: completedExercises / exerciseIds.length,
  };
}
