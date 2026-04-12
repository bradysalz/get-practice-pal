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

  const { data, error } = await client
    .from("practice_session_items")
    .upsert(
      {
        user_id: user.id,
        practice_session_id: input.sessionId,
        item_type: input.itemType,
        exercise_id: input.exerciseId ?? null,
        song_id: input.songId ?? null,
        tempo: input.tempo,
        display_order: input.displayOrder,
      },
      {
        onConflict: "practice_session_id,item_type,exercise_id,song_id",
      },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
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
