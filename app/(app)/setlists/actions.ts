"use server";

import { revalidatePath } from "next/cache";
import {
  addSetlistItem,
  createSetlist,
  deleteSetlistItem,
  reorderSetlistItems,
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
  const rawItems = formData.getAll("itemKey").map((item) => String(item));
  const position = Number(String(formData.get("position") ?? "0"));
  const returnPath = String(formData.get("returnPath") ?? "").trim() || null;
  const startPosition = Number.isFinite(position) ? position : 0;

  await Promise.all(
    rawItems.map((rawItem, index) => {
      const [itemType, itemId] = rawItem.split(":");

      return addSetlistItem({
        setlistId: String(formData.get("setlistId") ?? ""),
        itemType: itemType === "song" ? "song" : "exercise",
        exerciseId: itemType === "exercise" ? itemId : null,
        songId: itemType === "song" ? itemId : null,
        position: startPosition + index,
      });
    }),
  );

  revalidateSetlistsForPath(returnPath);
}

export async function deleteSetlistItemAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") ?? "").trim() || null;
  await deleteSetlistItem(String(formData.get("setlistItemId") ?? ""));
  revalidateSetlistsForPath(returnPath);
}

export async function reorderSetlistItemsAction(setlistId: string, itemIds: string[], returnPath?: string | null) {
  await reorderSetlistItems(setlistId, itemIds);
  revalidateSetlistsForPath(returnPath ?? null);
}
