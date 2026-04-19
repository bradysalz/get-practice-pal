import { requireSupabaseClient, requireUser } from "@/lib/auth/session";
import type {
  ArtistInsert,
  BookInsert,
  ExerciseInsert,
  SectionInsert,
  SetlistInsert,
  SetlistItemInsert,
  SongInsert,
} from "@/lib/data/types";

export type LibrarySnapshot = Awaited<ReturnType<typeof getLibrarySnapshot>>;

export async function getLibrarySnapshot() {
  const client = await requireSupabaseClient();
  const user = await requireUser();

  const [books, artists, setlists] = await Promise.all([
    client
      .from("books")
      .select("id, title, composer, external_book_id, created_at, external_book:external_books(id, provider, provider_book_id, isbn_10, isbn_13, title, subtitle, authors, published_year, published_date, cover_thumbnail_url, cover_small_url, cover_medium_url, cover_large_url, canonical_url), sections:book_sections(id, title, position, default_goal_tempo, exercises(id, title, position, goal_tempo))")
      .eq("user_id", user.id)
      .order("title"),
    client
      .from("artists")
      .select("id, name, songs(id, title, goal_tempo)")
      .eq("user_id", user.id)
      .order("name"),
    client
      .from("setlists")
      .select("id, name, description, items:setlist_items(id, item_type, exercise_id, song_id, position)")
      .eq("user_id", user.id)
      .order("name"),
  ]);

  if (books.error) throw books.error;
  if (artists.error) throw artists.error;
  if (setlists.error) throw setlists.error;

  return {
    books: books.data ?? [],
    artists: artists.data ?? [],
    setlists: setlists.data ?? [],
  };
}

export async function createBook(input: BookInsert) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("books")
    .insert({
      user_id: user.id,
      title: input.title,
      composer: input.composer ?? null,
      external_book_id: input.externalBookId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBook(
  bookId: string,
  input: {
    title: string;
    composer?: string | null;
    externalBookId?: string | null;
  },
) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("books")
    .update({
      title: input.title,
      composer: input.composer ?? null,
      external_book_id: input.externalBookId ?? null,
    })
    .eq("id", bookId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createSection(input: SectionInsert) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("book_sections")
    .insert({
      user_id: user.id,
      book_id: input.bookId,
      title: input.title,
      position: input.position,
      default_goal_tempo: input.defaultGoalTempo ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSection(
  sectionId: string,
  input: {
    title: string;
    position: number;
    defaultGoalTempo?: number | null;
  },
) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("book_sections")
    .update({
      title: input.title,
      position: input.position,
      default_goal_tempo: input.defaultGoalTempo ?? null,
    })
    .eq("id", sectionId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createExercise(input: ExerciseInsert) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("exercises")
    .insert({
      user_id: user.id,
      section_id: input.sectionId,
      title: input.title,
      position: input.position,
      goal_tempo: input.goalTempo ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createExercisesBatch(inputs: ExerciseInsert[]) {
  if (!inputs.length) {
    return [];
  }

  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("exercises")
    .insert(
      inputs.map((input) => ({
        user_id: user.id,
        section_id: input.sectionId,
        title: input.title,
        position: input.position,
        goal_tempo: input.goalTempo ?? null,
      })),
    )
    .select();

  if (error) throw error;
  return data ?? [];
}

export async function updateExercise(
  exerciseId: string,
  input: {
    title: string;
    position: number;
    goalTempo?: number | null;
  },
) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("exercises")
    .update({
      title: input.title,
      position: input.position,
      goal_tempo: input.goalTempo ?? null,
    })
    .eq("id", exerciseId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExercise(exerciseId: string) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { error } = await client
    .from("exercises")
    .delete()
    .eq("id", exerciseId)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function createArtist(input: ArtistInsert) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("artists")
    .insert({
      user_id: user.id,
      name: input.name,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateArtist(
  artistId: string,
  input: {
    name: string;
  },
) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("artists")
    .update({
      name: input.name,
    })
    .eq("id", artistId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createSong(input: SongInsert) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("songs")
    .insert({
      user_id: user.id,
      artist_id: input.artistId,
      title: input.title,
      goal_tempo: input.goalTempo ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSong(
  songId: string,
  input: {
    title: string;
    goalTempo?: number | null;
  },
) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("songs")
    .update({
      title: input.title,
      goal_tempo: input.goalTempo ?? null,
    })
    .eq("id", songId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createSetlist(input: SetlistInsert) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("setlists")
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSetlist(
  setlistId: string,
  input: {
    name: string;
    description?: string | null;
  },
) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("setlists")
    .update({
      name: input.name,
      description: input.description ?? null,
    })
    .eq("id", setlistId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addSetlistItem(input: SetlistItemInsert & { setlistId: string }) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { data, error } = await client
    .from("setlist_items")
    .insert({
      user_id: user.id,
      setlist_id: input.setlistId,
      item_type: input.itemType,
      exercise_id: input.exerciseId ?? null,
      song_id: input.songId ?? null,
      position: input.position,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSetlistItem(setlistItemId: string) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const { error } = await client
    .from("setlist_items")
    .delete()
    .eq("id", setlistItemId)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function replaceSetlistItems(setlistId: string, items: SetlistItemInsert[]) {
  const client = await requireSupabaseClient();
  const user = await requireUser();

  const deleteResult = await client
    .from("setlist_items")
    .delete()
    .eq("user_id", user.id)
    .eq("setlist_id", setlistId);

  if (deleteResult.error) throw deleteResult.error;

  if (!items.length) {
    return [];
  }

  const { data, error } = await client
    .from("setlist_items")
    .insert(
      items.map((item) => ({
        user_id: user.id,
        setlist_id: setlistId,
        item_type: item.itemType,
        exercise_id: item.exerciseId ?? null,
        song_id: item.songId ?? null,
        position: item.position,
      })),
    )
    .select();

  if (error) throw error;
  return data ?? [];
}

export async function reorderBookSections(bookId: string, sectionIds: string[]) {
  const client = await requireSupabaseClient();
  const user = await requireUser();

  await Promise.all(
    sectionIds.map((sectionId, index) =>
      client
        .from("book_sections")
        .update({ position: index + 1 })
        .eq("id", sectionId)
        .eq("book_id", bookId)
        .eq("user_id", user.id),
    ),
  );
}

export async function reorderSetlistItems(setlistId: string, itemIds: string[]) {
  const client = await requireSupabaseClient();
  const user = await requireUser();

  await Promise.all(
    itemIds.map((itemId, index) =>
      client
        .from("setlist_items")
        .update({ position: index + 1 })
        .eq("id", itemId)
        .eq("setlist_id", setlistId)
        .eq("user_id", user.id),
    ),
  );
}
