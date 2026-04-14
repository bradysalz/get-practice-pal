export type PracticeItemType = "exercise" | "song";

export type TimeRange = "1w" | "1m" | "6m" | "1y" | "all";

export type BookInsert = {
  title: string;
  composer?: string | null;
};

export type SectionInsert = {
  bookId: string;
  title: string;
  position: number;
  defaultGoalTempo?: number | null;
};

export type ExerciseInsert = {
  sectionId: string;
  title: string;
  position: number;
  goalTempo?: number | null;
};

export type ArtistInsert = {
  name: string;
};

export type SongInsert = {
  artistId: string;
  title: string;
  goalTempo?: number | null;
};

export type SetlistInsert = {
  name: string;
  description?: string | null;
};

export type SetlistItemInsert = {
  itemType: PracticeItemType;
  exerciseId?: string | null;
  songId?: string | null;
  position: number;
};

export type SessionStartInput = {
  startedAt?: string;
  sourceSetlistId?: string | null;
};

export type SessionEndInput = {
  endedAt?: string;
  notes?: string | null;
};

export type SessionItemUpsertInput = {
  sessionId: string;
  itemType: PracticeItemType;
  exerciseId?: string | null;
  songId?: string | null;
  tempo: number;
  displayOrder: number;
};
