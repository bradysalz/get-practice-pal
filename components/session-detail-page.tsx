import Link from "next/link";
import {
  createSetlistFromSessionAction,
  updateSessionItemGoalTempoAction,
} from "@/app/(app)/sessions/actions";
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
  const canEditGoalTempo = !session.ended_at;

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
              <SessionItemCard
                key={item.id}
                item={item}
                itemMaps={itemMaps}
                sessionId={session.id}
                canEditGoalTempo={canEditGoalTempo}
              />
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

function goalTempoValue(
  item: {
    item_type: "exercise" | "song";
    exercise_id: string | null;
    song_id: string | null;
  },
  itemMaps: ReturnType<typeof buildLibraryItemMaps>,
) {
  if (item.item_type === "exercise" && item.exercise_id) {
    return itemMaps.exerciseMap.get(item.exercise_id)?.goalTempo ?? null;
  }

  if (item.item_type === "song" && item.song_id) {
    return itemMaps.songMap.get(item.song_id)?.goalTempo ?? null;
  }

  return null;
}

function sessionItemHref(
  item: {
    item_type: "exercise" | "song";
    exercise_id: string | null;
    song_id: string | null;
  },
  itemMaps: ReturnType<typeof buildLibraryItemMaps>,
) {
  if (item.item_type === "exercise" && item.exercise_id) {
    return itemMaps.exerciseMap.get(item.exercise_id)?.href ?? null;
  }

  if (item.item_type === "song" && item.song_id) {
    return itemMaps.songMap.get(item.song_id)?.href ?? null;
  }

  return null;
}

function SessionItemCard({
  canEditGoalTempo,
  item,
  itemMaps,
  sessionId,
}: {
  canEditGoalTempo: boolean;
  item: {
    id: string;
    item_type: "exercise" | "song";
    exercise_id: string | null;
    song_id: string | null;
    tempo: number | null;
    display_order: number;
  };
  itemMaps: ReturnType<typeof buildLibraryItemMaps>;
  sessionId: string;
}) {
  const label = labelSessionItem(item, itemMaps);
  const lines = sessionItemPathLines(item, itemMaps);
  const href = sessionItemHref(item, itemMaps);
  const goalTempo = goalTempoValue(item, itemMaps);
  const exercise = item.item_type === "exercise" && item.exercise_id
    ? itemMaps.exerciseMap.get(item.exercise_id)
    : null;
  const song = item.item_type === "song" && item.song_id
    ? itemMaps.songMap.get(item.song_id)
    : null;

  return (
    <div className="list-row relative overflow-hidden p-4 transition-all hover:shadow-[3px_3px_0_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px]">
      {href ? <Link href={href} className="absolute inset-0" aria-label={`Open ${label}`} /> : null}
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <SessionItemLabel label={label} lines={lines} />
        </div>
        <div className="relative z-20 flex shrink-0 flex-col gap-2 md:items-end">
          {item.tempo ? <span className="chip chip-neutral">{item.tempo} BPM</span> : null}
          {goalTempo ? <span className="chip">Goal {goalTempo} BPM</span> : null}
          {canEditGoalTempo ? (
            <form
              action={updateSessionItemGoalTempoAction}
              className="flex flex-col gap-2 md:items-end"
            >
              <input type="hidden" name="sessionId" value={sessionId} />
              <input type="hidden" name="itemType" value={item.item_type} />
              <input type="hidden" name="exerciseId" value={item.exercise_id ?? ""} />
              <input type="hidden" name="songId" value={item.song_id ?? ""} />
              <input type="hidden" name="libraryPath" value={href ?? ""} />
              <input type="hidden" name="title" value={exercise?.title ?? song?.title ?? ""} />
              <input type="hidden" name="position" value={exercise ? String(exercise.position ?? "") : ""} />
              <label className="text-xs font-bold uppercase tracking-wide text-base-content/70 md:text-right">
                Goal tempo
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  name="goalTempo"
                  type="number"
                  min={1}
                  defaultValue={goalTempo ?? ""}
                  placeholder="Set BPM"
                  className="input input-bordered input-sm w-28 bg-base-100"
                />
                <FormSubmitButton
                  label="Save"
                  pendingLabel="Saving..."
                  className="btn btn-ghost btn-sm"
                />
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
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
