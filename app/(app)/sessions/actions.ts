"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSetlist, replaceSetlistItems, updateExercise, updateSong } from "@/lib/data/library";
import {
  deleteSessionItem,
  endSession,
  getSessionById,
  pauseSession,
  reorderSessionItems,
  resumeSession,
  startSession,
  updateSessionNotes,
  updateSessionItemReference,
  updateSessionItemTempo,
  upsertSessionItem,
} from "@/lib/data/sessions";

function revalidateSessions() {
  revalidatePath("/sessions");
}

function revalidateSessionDetail(sessionId: string) {
  revalidateSessions();
  revalidatePath(`/sessions/${sessionId}`);
}

function parseTempo(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Tempo must be a positive number.");
  }

  return parsed;
}

function parseOptionalTempo(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return null;
  }

  return parseTempo(rawValue);
}

export async function startSessionAction(formData: FormData) {
  const sourceSetlistId = String(formData.get("sourceSetlistId") ?? "").trim() || null;
  await startSession({ sourceSetlistId });
  revalidateSessions();
}

export async function pauseSessionAction(formData: FormData) {
  await pauseSession(String(formData.get("sessionId") ?? ""));
  revalidateSessions();
}

export async function resumeSessionAction(formData: FormData) {
  await resumeSession(String(formData.get("sessionId") ?? ""));
  revalidateSessions();
}

export async function endSessionAction(formData: FormData) {
  await endSession(String(formData.get("sessionId") ?? ""), {
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  revalidateSessions();
}

export async function updateSessionNotesAction(formData: FormData) {
  await updateSessionNotes(
    String(formData.get("sessionId") ?? ""),
    String(formData.get("notes") ?? "").trim() || null,
  );
  revalidateSessions();
}

export async function addSessionItemAction(formData: FormData) {
  const rawItems = formData.getAll("itemKey").map((item) => String(item));
  const displayOrder = Number(String(formData.get("displayOrder") ?? "0"));
  const startDisplayOrder = Number.isFinite(displayOrder) ? displayOrder : 0;

  if (!rawItems.length) {
    revalidateSessions();
    return;
  }

  const tempo = parseOptionalTempo(formData.get("tempo"));

  await Promise.all(
    rawItems.map((rawItem, index) => {
      const [itemType, itemId] = rawItem.split(":");

      return upsertSessionItem({
        sessionId: String(formData.get("sessionId") ?? ""),
        itemType: itemType === "song" ? "song" : "exercise",
        exerciseId: itemType === "exercise" ? itemId : null,
        songId: itemType === "song" ? itemId : null,
        tempo,
        displayOrder: startDisplayOrder + index,
      });
    }),
  );

  revalidateSessions();
}

export async function updateSessionItemAction(formData: FormData) {
  const sessionItemId = String(formData.get("sessionItemId") ?? "").trim();
  if (sessionItemId) {
    await updateSessionItemTempo(sessionItemId, parseOptionalTempo(formData.get("tempo")));
    revalidateSessions();
    return;
  }

  const itemType = String(formData.get("itemType") ?? "");
  const displayOrder = Number(String(formData.get("displayOrder") ?? "0"));

  await upsertSessionItem({
    sessionId: String(formData.get("sessionId") ?? ""),
    itemType: itemType === "song" ? "song" : "exercise",
    exerciseId: itemType === "exercise" ? String(formData.get("exerciseId") ?? "") || null : null,
    songId: itemType === "song" ? String(formData.get("songId") ?? "") || null : null,
    tempo: parseOptionalTempo(formData.get("tempo")),
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
  });

  revalidateSessions();
}

export async function updateSessionItemGoalTempoAction(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const itemType = String(formData.get("itemType") ?? "").trim();
  const libraryPath = String(formData.get("libraryPath") ?? "").trim();
  const goalTempo = parseOptionalTempo(formData.get("goalTempo"));

  if (itemType === "song") {
    await updateSong(String(formData.get("songId") ?? "").trim(), {
      title: String(formData.get("title") ?? "").trim(),
      goalTempo,
    });
  } else {
    await updateExercise(String(formData.get("exerciseId") ?? "").trim(), {
      title: String(formData.get("title") ?? "").trim(),
      position: Number(String(formData.get("position") ?? "0")),
      goalTempo,
    });
  }

  revalidateSessionDetail(sessionId);
  revalidatePath("/library");

  if (libraryPath) {
    revalidatePath(libraryPath);
  }
}

export async function updateSessionItemReferenceAction(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const selectedItem = String(formData.get("itemKey") ?? "").trim();

  if (!selectedItem) {
    throw new Error("Select one exercise or song.");
  }

  const [itemType, itemId] = selectedItem.split(":");

  await updateSessionItemReference({
    sessionItemId: String(formData.get("sessionItemId") ?? "").trim(),
    itemType: itemType === "song" ? "song" : "exercise",
    exerciseId: itemType === "exercise" ? itemId : null,
    songId: itemType === "song" ? itemId : null,
  });

  revalidateSessionDetail(sessionId);
}

export async function deleteSessionItemAction(formData: FormData) {
  await deleteSessionItem(String(formData.get("sessionItemId") ?? ""));
  revalidateSessionDetail(String(formData.get("sessionId") ?? ""));
}

export async function reorderSessionItemsAction(sessionId: string, itemIds: string[]) {
  await reorderSessionItems(sessionId, itemIds);
  revalidateSessionDetail(sessionId);
}

export async function createSetlistFromSessionAction(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");
  const session = await getSessionById(sessionId);
  const items = (session.session_items ?? [])
    .slice()
    .sort((left, right) => left.display_order - right.display_order)
    .filter((item) => item.exercise_id || item.song_id);

  const setlist = await createSetlist({
    name: `Session ${new Date(session.started_at).toLocaleDateString()}`,
    description: null,
  });

  await replaceSetlistItems(
    setlist.id,
    items.map((item, index) => ({
      itemType: item.item_type,
      exerciseId: item.exercise_id,
      songId: item.song_id,
      position: index + 1,
    })),
  );

  revalidatePath("/setlists");
  redirect(`/setlists/${setlist.id}`);
}
