"use server";

import { revalidatePath } from "next/cache";
import {
  deleteSessionItem,
  endSession,
  pauseSession,
  reorderSessionItems,
  resumeSession,
  startSession,
  updateSessionNotes,
  upsertSessionItem,
} from "@/lib/data/sessions";

function revalidateSessions() {
  revalidatePath("/sessions");
}

function parseTempo(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Tempo must be a positive number.");
  }

  return parsed;
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
  const rawItem = String(formData.get("itemKey") ?? "");
  const [itemType, itemId] = rawItem.split(":");
  const displayOrder = Number(String(formData.get("displayOrder") ?? "0"));

  await upsertSessionItem({
    sessionId: String(formData.get("sessionId") ?? ""),
    itemType: itemType === "song" ? "song" : "exercise",
    exerciseId: itemType === "exercise" ? itemId : null,
    songId: itemType === "song" ? itemId : null,
    tempo: parseTempo(formData.get("tempo")),
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
  });

  revalidateSessions();
}

export async function updateSessionItemAction(formData: FormData) {
  const itemType = String(formData.get("itemType") ?? "");
  const displayOrder = Number(String(formData.get("displayOrder") ?? "0"));

  await upsertSessionItem({
    sessionId: String(formData.get("sessionId") ?? ""),
    itemType: itemType === "song" ? "song" : "exercise",
    exerciseId: itemType === "exercise" ? String(formData.get("exerciseId") ?? "") || null : null,
    songId: itemType === "song" ? String(formData.get("songId") ?? "") || null : null,
    tempo: parseTempo(formData.get("tempo")),
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
  });

  revalidateSessions();
}

export async function deleteSessionItemAction(formData: FormData) {
  await deleteSessionItem(String(formData.get("sessionItemId") ?? ""));
  revalidateSessions();
}

export async function reorderSessionItemsAction(sessionId: string, itemIds: string[]) {
  await reorderSessionItems(sessionId, itemIds);
  revalidateSessions();
}
