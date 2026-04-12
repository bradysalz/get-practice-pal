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

export async function getLibrarySnapshot() {
  const client = await requireSupabaseClient();
  const user = await requireUser();

  const [books, artists, setlists] = await Promise.all([
    client
      .from("books")
      .select("id, title, composer, default_goal_tempo, created_at, sections:book_sections(id, title, position, default_goal_tempo, exercises(id, title, position, goal_tempo))")
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
      default_goal_tempo: input.defaultGoalTempo ?? null,
    })
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
