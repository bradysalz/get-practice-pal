"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createArtist,
  createBook,
  createExercise,
  createExercisesBatch,
  createSection,
  createSong,
  deleteArtist,
  deleteBook,
  deleteExercise,
  deleteSection,
  deleteSong,
  reorderBookSections,
  updateArtist,
  updateBook,
  updateExercise,
  updateSection,
  updateSong,
} from "@/lib/data/library";
import {
  externalBookUpsertFromGoogleBooksCandidate,
  upsertExternalBook,
} from "@/lib/data/external-books";
import { type GoogleBooksCandidate, searchGoogleBooks } from "@/lib/data/google-books";
import { buildExerciseNames, type ExerciseNamingType } from "@/lib/section-builder";

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const parsed = Number(text);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Goal tempo must be a positive number.");
  }

  return parsed;
}

function parseRequiredNumber(value: FormDataEntryValue | null, field: string) {
  const text = String(value ?? "").trim();
  const parsed = Number(text);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${field} must be a number.`);
  }

  return parsed;
}

function finishLibraryAction() {
  revalidatePath("/library");
  revalidatePath("/library/books");
  revalidatePath("/library/artists");
}

export async function createBookAction(formData: FormData) {
  await createBook({
    title: String(formData.get("title") ?? "").trim(),
    composer: String(formData.get("composer") ?? "").trim() || null,
    externalBookId: String(formData.get("externalBookId") ?? "").trim() || null,
  });

  finishLibraryAction();
}

export async function updateBookAction(formData: FormData) {
  await updateBook(String(formData.get("bookId") ?? ""), {
    title: String(formData.get("title") ?? "").trim(),
    composer: String(formData.get("composer") ?? "").trim() || null,
    externalBookId: String(formData.get("externalBookId") ?? "").trim() || null,
  });

  finishLibraryAction();
}

export async function deleteBookAction(formData: FormData) {
  await deleteBook(String(formData.get("bookId") ?? "").trim());
  finishLibraryAction();
  redirect("/library");
}

export async function searchBookMetadataAction(formData: FormData) {
  return searchGoogleBooks({
    author: String(formData.get("author") ?? "").trim(),
    isbn: String(formData.get("isbn") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
  });
}

export async function saveBookMetadataSelectionAction(candidate: GoogleBooksCandidate) {
  const externalBook = await upsertExternalBook(
    externalBookUpsertFromGoogleBooksCandidate(candidate),
  );

  finishLibraryAction();
  return externalBook;
}

export async function createSectionAction(formData: FormData) {
  const bookId = String(formData.get("bookId") ?? "");
  const section = await createSection({
    bookId,
    title: String(formData.get("title") ?? "").trim(),
    position: parseRequiredNumber(formData.get("position"), "Position"),
    defaultGoalTempo: parseOptionalNumber(formData.get("defaultGoalTempo")),
  });

  finishLibraryAction();
  redirect(`/library/books/${bookId}/sections/${section.id}`);
}

export async function updateSectionAction(formData: FormData) {
  await updateSection(String(formData.get("sectionId") ?? ""), {
    title: String(formData.get("title") ?? "").trim(),
    position: parseRequiredNumber(formData.get("position"), "Position"),
    defaultGoalTempo: parseOptionalNumber(formData.get("defaultGoalTempo")),
  });

  finishLibraryAction();
}

export async function deleteSectionAction(formData: FormData) {
  const sectionId = String(formData.get("sectionId") ?? "").trim();
  const bookId = String(formData.get("bookId") ?? "").trim();

  await deleteSection(sectionId);
  finishLibraryAction();
  redirect(`/library/books/${bookId}`);
}

export async function createExerciseAction(formData: FormData) {
  await createExercise({
    sectionId: String(formData.get("sectionId") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    position: parseRequiredNumber(formData.get("position"), "Position"),
    goalTempo: parseOptionalNumber(formData.get("goalTempo")),
  });

  finishLibraryAction();
}

export async function updateExerciseAction(formData: FormData) {
  await updateExercise(String(formData.get("exerciseId") ?? ""), {
    title: String(formData.get("title") ?? "").trim(),
    position: parseRequiredNumber(formData.get("position"), "Position"),
    goalTempo: parseOptionalNumber(formData.get("goalTempo")),
  });

  finishLibraryAction();
}

export async function deleteExerciseAction(formData: FormData) {
  const exerciseId = String(formData.get("exerciseId") ?? "").trim();
  const bookId = String(formData.get("bookId") ?? "").trim();
  const sectionId = String(formData.get("sectionId") ?? "").trim();

  await deleteExercise(exerciseId);
  finishLibraryAction();
  revalidatePath(`/library/books/${bookId}/sections/${sectionId}`);
  redirect(`/library/books/${bookId}/sections/${sectionId}`);
}

export async function createArtistAction(formData: FormData) {
  await createArtist({
    name: String(formData.get("name") ?? "").trim(),
  });

  finishLibraryAction();
}

export async function updateArtistAction(formData: FormData) {
  await updateArtist(String(formData.get("artistId") ?? ""), {
    name: String(formData.get("name") ?? "").trim(),
  });

  finishLibraryAction();
}

export async function deleteArtistAction(formData: FormData) {
  await deleteArtist(String(formData.get("artistId") ?? "").trim());
  finishLibraryAction();
  redirect("/library");
}

export async function createSongAction(formData: FormData) {
  await createSong({
    artistId: String(formData.get("artistId") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    goalTempo: parseOptionalNumber(formData.get("goalTempo")),
  });

  finishLibraryAction();
}

export async function updateSongAction(formData: FormData) {
  await updateSong(String(formData.get("songId") ?? ""), {
    title: String(formData.get("title") ?? "").trim(),
    goalTempo: parseOptionalNumber(formData.get("goalTempo")),
  });

  finishLibraryAction();
}

export async function deleteSongAction(formData: FormData) {
  const songId = String(formData.get("songId") ?? "").trim();
  const artistId = String(formData.get("artistId") ?? "").trim();

  await deleteSong(songId);
  finishLibraryAction();
  redirect(`/library/artists/${artistId}`);
}

export async function saveSectionBuilderAction(formData: FormData) {
  const sectionId = String(formData.get("sectionId") ?? "").trim();
  const bookId = String(formData.get("bookId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const position = parseRequiredNumber(formData.get("position"), "Position");
  const defaultGoalTempo = parseOptionalNumber(formData.get("defaultGoalTempo"));
  const exerciseCount = Math.max(0, parseRequiredNumber(formData.get("exerciseCount"), "Exercise count"));
  const namingType = String(formData.get("namingType") ?? "numeric").trim() as ExerciseNamingType;
  const exercisePrefix = String(formData.get("exercisePrefix") ?? "").trim() || "Exercise";
  const exerciseStartNumber = Math.max(1, parseRequiredNumber(formData.get("exerciseStartNumber"), "First exercise number"));

  const section = sectionId
    ? await updateSection(sectionId, {
        title,
        position,
        defaultGoalTempo,
      })
    : await createSection({
        bookId,
        title,
        position,
        defaultGoalTempo,
      });

  if (exerciseCount > 0) {
    const existingCount = Number(String(formData.get("existingExerciseCount") ?? "0")) || 0;
    const names = namingType === "manual"
      ? parseManualExerciseNames(formData.get("manualExerciseNames"))
      : buildExerciseNames(exerciseCount, namingType, exercisePrefix, exerciseStartNumber);

    await createExercisesBatch(
      names.map((exerciseTitle, index) => ({
        sectionId: section.id,
        title: exerciseTitle,
        position: existingCount + index + 1,
      })),
    );
  }

  finishLibraryAction();
  if (!sectionId) {
    redirect(`/library/books/${bookId}/sections/${section.id}`);
  }
}

export async function reorderBookSectionsAction(bookId: string, sectionIds: string[]) {
  await reorderBookSections(bookId, sectionIds);
  finishLibraryAction();
}

function parseManualExerciseNames(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}
