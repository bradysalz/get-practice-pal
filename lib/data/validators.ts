import type { PracticeItemType } from "@/lib/data/types";

export function validateTempo(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Tempo must be a positive number.");
  }
}

export function assertPracticeItemReference(input: {
  itemType: PracticeItemType;
  exerciseId?: string | null;
  songId?: string | null;
}) {
  const hasExercise = Boolean(input.exerciseId);
  const hasSong = Boolean(input.songId);

  if (input.itemType === "exercise" && (!hasExercise || hasSong)) {
    throw new Error("Exercise items must reference exactly one exercise.");
  }

  if (input.itemType === "song" && (!hasSong || hasExercise)) {
    throw new Error("Song items must reference exactly one song.");
  }
}

export function getRangeStart(range: "1w" | "1m" | "6m" | "1y" | "all") {
  const now = new Date();

  switch (range) {
    case "1w":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "1m":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "6m":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "1y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "all":
      return null;
  }
}
