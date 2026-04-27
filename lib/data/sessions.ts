import { requireSupabaseClient, requireUser } from "@/lib/auth/session";
import type { SessionEndInput, SessionItemUpsertInput, SessionStartInput } from "@/lib/data/types";
import { assertPracticeItemReference, validateTempo } from "@/lib/data/validators";

export async function getCurrentSession() {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("practice_sessions")
    .select("id, started_at, ended_at, paused_at, is_paused, notes, source_setlist_id")
    .eq("user_id", user.id)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listRecentSessions(limit = 10) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("practice_sessions")
    .select("id, started_at, ended_at, paused_at, is_paused, notes, session_items:practice_session_items(id, item_type, exercise_id, song_id, tempo, display_order)")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getSessionById(sessionId: string) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("practice_sessions")
    .select("id, started_at, ended_at, paused_at, is_paused, notes, source_setlist_id, session_items:practice_session_items(id, item_type, exercise_id, song_id, tempo, display_order)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function startSession(input: SessionStartInput = {}) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("practice_sessions")
    .insert({
      user_id: user.id,
      started_at: input.startedAt ?? new Date().toISOString(),
      source_setlist_id: input.sourceSetlistId ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  if (input.sourceSetlistId) {
    const { data: setlistItems, error: setlistItemsError } = await client
      .from("setlist_items")
      .select("item_type, exercise_id, song_id, position, exercise:exercises(goal_tempo), song:songs(goal_tempo)")
      .eq("user_id", user.id)
      .eq("setlist_id", input.sourceSetlistId)
      .order("position");

    if (setlistItemsError) throw setlistItemsError;

    if (setlistItems?.length) {
      const { error: preloadError } = await client.from("practice_session_items").insert(
        setlistItems.map((item) => ({
          user_id: user.id,
          practice_session_id: data.id,
          item_type: item.item_type,
          exercise_id: item.exercise_id,
          song_id: item.song_id,
          display_order: item.position,
          tempo: null,
        })),
      );

      if (preloadError) throw preloadError;
    }
  }

  return data;
}

export async function pauseSession(sessionId: string) {
  return updateSessionState(sessionId, {
    is_paused: true,
    paused_at: new Date().toISOString(),
  });
}

export async function resumeSession(sessionId: string) {
  return updateSessionState(sessionId, {
    is_paused: false,
    paused_at: null,
  });
}

export async function endSession(sessionId: string, input: SessionEndInput = {}) {
  return updateSessionState(sessionId, {
    ended_at: input.endedAt ?? new Date().toISOString(),
    is_paused: false,
    paused_at: null,
    notes: input.notes ?? null,
  });
}

export async function updateSessionNotes(sessionId: string, notes: string | null) {
  return updateSessionState(sessionId, {
    notes,
  });
}

export async function upsertSessionItem(input: SessionItemUpsertInput) {
  const client = await requireSupabaseClient();
  const user = await requireUser();

  validateTempo(input.tempo);
  assertPracticeItemReference(input);

  const itemPatch = {
    user_id: user.id,
    practice_session_id: input.sessionId,
    item_type: input.itemType,
    exercise_id: input.exerciseId ?? null,
    song_id: input.songId ?? null,
    tempo: input.tempo,
    display_order: input.displayOrder,
  };

  let existingQuery = client
    .from("practice_session_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("practice_session_id", input.sessionId)
    .eq("item_type", input.itemType);

  existingQuery =
    input.itemType === "exercise"
      ? existingQuery.eq("exercise_id", input.exerciseId!).is("song_id", null)
      : existingQuery.eq("song_id", input.songId!).is("exercise_id", null);

  const { data: existingItem, error: existingError } = await existingQuery.maybeSingle();

  if (existingError) throw existingError;

  const mutation = existingItem
    ? client
        .from("practice_session_items")
        .update({
          tempo: input.tempo,
          display_order: input.displayOrder,
        })
        .eq("id", existingItem.id)
        .eq("user_id", user.id)
    : client.from("practice_session_items").insert(itemPatch);

  const { data, error } = await mutation.select().single();

  if (error) throw error;
  return data;
}

export async function updateSessionItemTempo(sessionItemId: string, tempo: number | null) {
  const client = await requireSupabaseClient();
  const user = await requireUser();

  validateTempo(tempo);

  const { data, error } = await client
    .from("practice_session_items")
    .update({ tempo })
    .eq("id", sessionItemId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSessionItemReference(input: {
  sessionItemId: string;
  itemType: "exercise" | "song";
  exerciseId?: string | null;
  songId?: string | null;
}) {
  const client = await requireSupabaseClient();
  const user = await requireUser();

  assertPracticeItemReference(input);

  const { data, error } = await client
    .from("practice_session_items")
    .update({
      item_type: input.itemType,
      exercise_id: input.exerciseId ?? null,
      song_id: input.songId ?? null,
    })
    .eq("id", input.sessionItemId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSessionItem(sessionItemId: string) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { error } = await client
    .from("practice_session_items")
    .delete()
    .eq("id", sessionItemId)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function reorderSessionItems(sessionId: string, itemIds: string[]) {
  const client = await requireSupabaseClient();
  const user = await requireUser();

  await Promise.all(
    itemIds.map((itemId, index) =>
      client
        .from("practice_session_items")
        .update({ display_order: index })
        .eq("id", itemId)
        .eq("practice_session_id", sessionId)
        .eq("user_id", user.id),
    ),
  );
}

async function updateSessionState(sessionId: string, patch: Record<string, string | boolean | null>) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("practice_sessions")
    .update(patch)
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
