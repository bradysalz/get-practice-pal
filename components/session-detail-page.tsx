import Link from "next/link";
import { createSetlistFromSessionAction } from "@/app/(app)/sessions/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { EmptyState, PageHero, PagePanel, StatCard } from "@/components/ui/primitives";
import type { LibrarySnapshot } from "@/lib/data/library";
import { buildLibraryItemMaps } from "@/lib/data/view-models";

type SessionDetailPageProps = {
  session: {
    id: string;
    started_at: string;
    ended_at: string | null;
    paused_at: string | null;
    is_paused: boolean;
    notes: string | null;
    source_setlist_id: string | null;
    session_items?: Array<{
      id: string;
      item_type: "exercise" | "song";
      exercise_id: string | null;
      song_id: string | null;
      tempo: number | null;
      display_order: number;
    }>;
  };
  snapshot: LibrarySnapshot;
};

export function SessionDetailPage({ session, snapshot }: SessionDetailPageProps) {
  const itemMaps = buildLibraryItemMaps(snapshot);
  const sourceSetlist = snapshot.setlists.find((setlist) => setlist.id === session.source_setlist_id);
  const sortedItems = (session.session_items ?? [])
    .slice()
    .sort((left, right) => left.display_order - right.display_order);

  return (
    <div className="space-y-6">
      <PageHero
        backHref="/sessions"
        backLabel="Back to sessions"
        eyebrow="Session"
        title={formatDateTime(session.started_at)}
        stats={
          <div className="grid grid-cols-2 gap-3 md:min-w-[18rem]">
            <StatCard label="Duration" value={formatDurationLabel(session.started_at, session.ended_at)} />
            <StatCard label="Items" value={String(sortedItems.length)} />
          </div>
        }
        actions={
          sortedItems.length ? (
            <form action={createSetlistFromSessionAction}>
              <input type="hidden" name="sessionId" value={session.id} />
              <FormSubmitButton label="Create setlist" pendingLabel="Creating..." className="btn btn-primary" />
            </form>
          ) : null
        }
      >
        <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
          <span>{session.ended_at ? "Completed" : session.is_paused ? "Paused" : "In progress"}</span>
          {sourceSetlist ? (
            <>
              <span>·</span>
              <Link href={`/setlists/${sourceSetlist.id}`} className="text-primary">
                {sourceSetlist.name}
              </Link>
            </>
          ) : null}
        </div>
      </PageHero>

      {session.notes ? (
        <PagePanel className="border-primary bg-red-50">
          <h2 className="text-lg font-bold text-primary">Notes</h2>
          <p className="mt-4 whitespace-pre-wrap text-base-content/80">{session.notes}</p>
        </PagePanel>
      ) : null}

      <PagePanel>
        <h2 className="text-lg font-bold text-primary">Logged items</h2>
        <div className="mt-5 space-y-3">
          {sortedItems.length ? (
            sortedItems.map((item) => (
              <div key={item.id} className="list-row p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <SessionItemLabel
                      label={labelSessionItem(item, itemMaps)}
                      lines={sessionItemPathLines(item, itemMaps)}
                    />
                    <p className="mt-2 text-sm text-base-content/80">
                      {item.item_type === "exercise" ? "Exercise" : "Song"}
                    </p>
                  </div>
                  {item.tempo ? <span className="chip chip-neutral">{item.tempo} BPM</span> : null}
                </div>
              </div>
            ))
          ) : (
            <EmptyState label="No logged items in this session." />
          )}
        </div>
      </PagePanel>
    </div>
  );
}

function labelSessionItem(
  item: {
    item_type: "exercise" | "song";
    exercise_id: string | null;
    song_id: string | null;
  },
  itemMaps: ReturnType<typeof buildLibraryItemMaps>,
) {
  if (item.item_type === "exercise" && item.exercise_id) {
    return itemMaps.exerciseMap.get(item.exercise_id)?.label ?? "Unknown exercise";
  }

  if (item.item_type === "song" && item.song_id) {
    return itemMaps.songMap.get(item.song_id)?.label ?? "Unknown song";
  }

  return "Unknown item";
}

function sessionItemPathLines(
  item: {
    item_type: "exercise" | "song";
    exercise_id: string | null;
    song_id: string | null;
  },
  itemMaps: ReturnType<typeof buildLibraryItemMaps>,
) {
  if (item.item_type === "exercise" && item.exercise_id) {
    const exercise = itemMaps.exerciseMap.get(item.exercise_id);
    return exercise ? [exercise.bookTitle, exercise.sectionTitle, exercise.title] : ["Unknown exercise"];
  }

  if (item.item_type === "song" && item.song_id) {
    const song = itemMaps.songMap.get(item.song_id);
    return song ? [song.artistName, song.title] : ["Unknown song"];
  }

  return ["Unknown item"];
}

function SessionItemLabel({
  label,
  lines,
}: {
  label: string;
  lines: string[];
}) {
  return (
    <div className="min-w-0 space-y-1" title={label}>
      {lines.map((line, index) => (
        <p
          key={`${line}-${index}`}
          className={index === lines.length - 1
            ? "truncate font-semibold leading-tight text-base-content"
            : "truncate text-sm leading-tight text-base-content/80"}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDurationLabel(startedAt: string, endedAt: string | null) {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt ?? Date.now()).getTime();
  const totalMinutes = Math.max(1, Math.round((end - start) / 60000));

  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${totalMinutes}m`;
}
