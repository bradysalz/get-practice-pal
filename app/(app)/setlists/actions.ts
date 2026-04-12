"use server";

import { revalidatePath } from "next/cache";
import {
  addSetlistItem,
  createSetlist,
  deleteSetlistItem,
  updateSetlist,
} from "@/lib/data/library";

function revalidateSetlists() {
  revalidatePath("/setlists");
  revalidatePath("/sessions");
}

function revalidateSetlistsForPath(path: string | null) {
  revalidateSetlists();

  if (path) {
    revalidatePath(path);
  }
}

export async function createSetlistAction(formData: FormData) {
  await createSetlist({
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
  });

  revalidateSetlists();
}

export async function updateSetlistAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") ?? "").trim() || null;

  await updateSetlist(String(formData.get("setlistId") ?? ""), {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
  });

  revalidateSetlistsForPath(returnPath);
}

export async function addSetlistItemAction(formData: FormData) {
  const rawItem = String(formData.get("itemKey") ?? "");
  const [itemType, itemId] = rawItem.split(":");
  const position = Number(String(formData.get("position") ?? "0"));
  const returnPath = String(formData.get("returnPath") ?? "").trim() || null;

  await addSetlistItem({
    setlistId: String(formData.get("setlistId") ?? ""),
    itemType: itemType === "song" ? "song" : "exercise",
    exerciseId: itemType === "exercise" ? itemId : null,
    songId: itemType === "song" ? itemId : null,
    position: Number.isFinite(position) ? position : 0,
  });

  revalidateSetlistsForPath(returnPath);
}

export async function deleteSetlistItemAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") ?? "").trim() || null;
  await deleteSetlistItem(String(formData.get("setlistItemId") ?? ""));
  revalidateSetlistsForPath(returnPath);
}
