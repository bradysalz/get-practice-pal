import type { LibrarySnapshot } from "@/lib/data/library";

export function buildLibraryItemMaps(snapshot: Pick<LibrarySnapshot, "artists" | "books">) {
  const exerciseMap = new Map<
    string,
    {
      bookTitle: string;
      goalTempo: number | null;
      href: string;
      itemType: "exercise";
      label: string;
      position: number;
      sectionTitle: string;
      title: string;
    }
  >();
  const songMap = new Map<
    string,
    {
      artistName: string;
      goalTempo: number | null;
      href: string;
      itemType: "song";
      label: string;
      title: string;
    }
  >();

  for (const book of snapshot.books) {
    for (const section of book.sections ?? []) {
      for (const exercise of section.exercises ?? []) {
        exerciseMap.set(exercise.id, {
          itemType: "exercise",
          title: exercise.title,
          bookTitle: book.title,
          goalTempo: exercise.goal_tempo,
          href: `/library/books/${book.id}/sections/${section.id}/exercises/${exercise.id}`,
          sectionTitle: section.title,
          position: exercise.position,
          label: `${book.title} / ${section.title} / ${exercise.title}`,
        });
      }
    }
  }

  for (const artist of snapshot.artists) {
    for (const song of artist.songs ?? []) {
      songMap.set(song.id, {
        itemType: "song",
        title: song.title,
        artistName: artist.name,
        goalTempo: song.goal_tempo,
        href: `/library/artists/${artist.id}/songs/${song.id}`,
        label: `${artist.name} / ${song.title}`,
      });
    }
  }

  return {
    exerciseMap,
    songMap,
  };
}
