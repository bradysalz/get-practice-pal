import { requireSupabaseClient, requireUser } from "@/lib/auth/session";
import type { PracticeItemType, TimeRange } from "@/lib/data/types";
import { assertPracticeItemReference, getRangeStart } from "@/lib/data/validators";

type RawTempoEntry = {
  tempo: number | null;
  created_at: string;
  practice_sessions?: {
    started_at: string;
  }[] | null;
};

type RawItemRow = {
  tempo: number | null;
  created_at: string;
  practice_session_id: string;
  exercise_id: string | null;
  song_id: string | null;
};

const ID_BATCH_SIZE = 200;

export type ItemProgressSummary = {
  goalTempo: number | null;
  currentMaxTempo: number;
  completionRatio: number;
  completed: boolean;
  entryCount: number;
  lastRecordedAt: string | null;
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
    .not("tempo", "is", null)
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

  const entries = ((data ?? []) as unknown as RawTempoEntry[])
    .filter((entry): entry is RawTempoEntry & { tempo: number } => entry.tempo != null)
    .map((entry) => ({
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

export async function getItemProgressSummaryMap(input: {
  itemType: PracticeItemType;
  items: Array<{ id: string; goalTempo: number | null }>;
  excludeSessionId?: string | null;
  range?: TimeRange;
}) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const rangeStart = getRangeStart(input.range ?? "all");
  const ids = input.items.map((item) => item.id);

  const emptyMap = new Map<string, ItemProgressSummary>();

  for (const item of input.items) {
    emptyMap.set(item.id, {
      goalTempo: item.goalTempo,
      currentMaxTempo: 0,
      completionRatio: 0,
      completed: false,
      entryCount: 0,
      lastRecordedAt: null,
    });
  }

  if (!ids.length) {
    return emptyMap;
  }

  const rows: RawItemRow[] = [];

  for (const idBatch of chunkArray(ids, ID_BATCH_SIZE)) {
    let query = client
      .from("practice_session_items")
      .select("tempo, created_at, practice_session_id, exercise_id, song_id")
      .eq("user_id", user.id)
      .eq("item_type", input.itemType)
      .not("tempo", "is", null)
      .order("created_at", { ascending: true });

    query =
      input.itemType === "exercise"
        ? query.in("exercise_id", idBatch)
        : query.in("song_id", idBatch);

    if (rangeStart) {
      query = query.gte("created_at", rangeStart.toISOString());
    }

    if (input.excludeSessionId) {
      query = query.neq("practice_session_id", input.excludeSessionId);
    }

    const { data, error } = await query;

    if (error) throw error;

    rows.push(...((data ?? []) as RawItemRow[]));
  }

  for (const row of rows) {
    const id = input.itemType === "exercise" ? row.exercise_id : row.song_id;

    if (!id) {
      continue;
    }

    const current = emptyMap.get(id);

    if (!current) {
      continue;
    }

    if (row.tempo == null) {
      continue;
    }

    const currentMaxTempo = Math.max(current.currentMaxTempo, row.tempo);
    const goalTempo = current.goalTempo;

    emptyMap.set(id, {
      goalTempo,
      currentMaxTempo,
      completionRatio: goalTempo && goalTempo > 0 ? currentMaxTempo / goalTempo : 0,
      completed: goalTempo ? currentMaxTempo >= goalTempo : false,
      entryCount: current.entryCount + 1,
      lastRecordedAt: row.created_at,
    });
  }

  return emptyMap;
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

  const maxByExercise = new Map<string, number>();

  for (const idBatch of chunkArray(exerciseIds, ID_BATCH_SIZE)) {
    let itemQuery = client
      .from("practice_session_items")
      .select("exercise_id, tempo")
      .eq("user_id", user.id)
      .eq("item_type", "exercise")
      .not("tempo", "is", null)
      .in("exercise_id", idBatch);

    if (rangeStart) {
      itemQuery = itemQuery.gte("created_at", rangeStart.toISOString());
    }

    const items = await itemQuery;

    if (items.error) throw items.error;

    for (const item of items.data ?? []) {
      if (!item.exercise_id || item.tempo == null) {
        continue;
      }

      maxByExercise.set(
        item.exercise_id,
        Math.max(maxByExercise.get(item.exercise_id) ?? 0, item.tempo),
      );
    }
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

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
