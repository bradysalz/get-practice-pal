import {
  addSessionItemAction,
  endSessionAction,
  pauseSessionAction,
  resumeSessionAction,
  startSessionAction,
} from "@/app/(app)/sessions/actions";
import { DraggableSessionItems } from "@/components/draggable-session-items";
import { FormSelect } from "@/components/form-select";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { LibrarySnapshot } from "@/lib/data/library";
import { buildLibraryItemMaps } from "@/lib/data/view-models";

type SessionsDashboardProps = {
  currentSession: {
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
      tempo: number;
      display_order: number;
    }>;
  } | null;
  librarySnapshot: LibrarySnapshot;
  recentSessions: Array<{
    id: string;
    started_at: string;
    ended_at: string | null;
    paused_at: string | null;
    is_paused: boolean;
    notes: string | null;
    session_items?: Array<{
      id: string;
      item_type: "exercise" | "song";
      exercise_id: string | null;
      song_id: string | null;
      tempo: number;
      display_order: number;
    }>;
  }>;
};

export function SessionsDashboard({
  currentSession,
  librarySnapshot,
  recentSessions,
}: SessionsDashboardProps) {
  const itemMaps = buildLibraryItemMaps(librarySnapshot);
  const itemOptions = [
    ...Array.from(itemMaps.exerciseMap.entries()).map(([id, item]) => ({
      value: `exercise:${id}`,
      label: item.label,
    })),
    ...Array.from(itemMaps.songMap.entries()).map(([id, item]) => ({
      value: `song:${id}`,
      label: item.label,
    })),
  ].sort((left, right) => left.label.localeCompare(right.label));

  return (
    <div className="space-y-6">
      <section className="page-hero p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Sessions</p>
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              Log practice as you go.
            </h1>
          </div>
          <div className="soft-stat px-5 py-4 text-sm text-base-content/75">
            {currentSession ? "An active session is in progress." : "No active session right now."}
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <div className="space-y-6">
          {currentSession ? (
            <section className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="eyebrow">Active Session</p>
                  <h2 className="font-display mt-2 text-2xl font-semibold text-base-content">
                    Started {formatDateTime(currentSession.started_at)}
                  </h2>
                  <p className="mt-2 text-sm text-base-content/70">
                    {currentSession.is_paused ? "Paused" : "Running"} · {currentSession.session_items?.length ?? 0} logged item
                    {(currentSession.session_items?.length ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {currentSession.is_paused ? (
                    <form action={resumeSessionAction}>
                      <input type="hidden" name="sessionId" value={currentSession.id} />
                      <FormSubmitButton label="Resume" pendingLabel="Resuming..." className="btn btn-primary" />
                    </form>
                  ) : (
                    <form action={pauseSessionAction}>
                      <input type="hidden" name="sessionId" value={currentSession.id} />
                      <FormSubmitButton label="Pause" pendingLabel="Pausing..." className="btn btn-outline" />
                    </form>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <section className="page-panel space-y-4 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-base-content">Logged items</h3>
                  </div>
                  {currentSession.session_items?.length ? (
                    <DraggableSessionItems
                      items={currentSession.session_items
                        .slice()
                        .sort((left, right) => left.display_order - right.display_order)
                        .map((item) => ({
                          exerciseId: item.exercise_id,
                          id: item.id,
                          itemType: item.item_type,
                          label: labelSessionItem(item, itemMaps),
                          songId: item.song_id,
                          tempo: item.tempo,
                        }))}
                      sessionId={currentSession.id}
                    />
                  ) : (
                    <EmptyBox label="No exercises or songs logged yet." />
                  )}
                </section>

                <form action={addSessionItemAction} className="page-panel p-6">
                  <input type="hidden" name="sessionId" value={currentSession.id} />
                  <input type="hidden" name="displayOrder" value={String(currentSession.session_items?.length ?? 0)} />
                  <h3 className="text-lg font-semibold text-primary">Add item</h3>
                  <div className="mt-4 space-y-3">
                    <FormSelect
                      label="Library item"
                      name="itemKey"
                      emptyLabel="Select exercise or song"
                      options={itemOptions}
                    />
                    <div className="grid gap-3 md:grid-cols-1">
                      <label className="form-control w-full">
                        <span className="label-text mb-2 text-sm font-medium text-base-content">Tempo</span>
                        <input className="input app-field w-full" name="tempo" type="number" min={1} />
                      </label>
                    </div>
                    <FormSubmitButton label="Log item" pendingLabel="Logging..." />
                  </div>
                </form>

                <form action={endSessionAction} className="page-panel p-6">
                  <input type="hidden" name="sessionId" value={currentSession.id} />
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary">Session notes</h3>
                      <textarea
                        className="textarea app-textarea mt-4 min-h-32 w-full"
                        name="notes"
                        defaultValue={currentSession.notes ?? ""}
                        placeholder="How did the session feel?"
                      />
                    </div>
                    <div className="md:pt-[2.7rem]">
                      <FormSubmitButton label="End session" pendingLabel="Ending..." className="btn btn-error" />
                    </div>
                  </div>
                </form>
              </div>
            </section>
          ) : (
            <section className="page-panel p-6">
              <h2 className="font-display text-xl font-semibold text-base-content">Start a session</h2>
              <form action={startSessionAction} className="mt-5 max-w-xl space-y-4">
                <FormSelect
                  label="Setlist"
                  name="sourceSetlistId"
                  emptyLabel="Scratch"
                  options={librarySnapshot.setlists.map((setlist) => ({
                    value: setlist.id,
                    label: setlist.name,
                  }))}
                />
                <div className="mt-4">
                  <FormSubmitButton label="Start session" pendingLabel="Starting..." />
                </div>
              </form>
            </section>
          )}

          {!currentSession ? (
          <section className="page-panel p-6">
            <h2 className="font-display text-xl font-semibold text-base-content">Recent sessions</h2>
            <div className="mt-5 space-y-3">
              {recentSessions.length ? (
                recentSessions.map((session) => (
                  <div key={session.id} className="list-row p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-base-content">{formatDateTime(session.started_at)}</p>
                        <p className="text-sm text-base-content/65">{formatDurationLabel(session.started_at, session.ended_at)}</p>
                      </div>
                      <span className="chip chip-neutral">
                        {(session.session_items?.length ?? 0)} item{(session.session_items?.length ?? 0) === 1 ? "" : "s"}
                      </span>
                    </div>
                    {session.notes ? (
                      <p className="mt-3 text-sm leading-6 text-base-content/75">{session.notes}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyBox label="No session history yet." />
              )}
            </div>
          </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function EmptyBox({ label }: { label: string }) {
  return (
    <div className="empty-box px-4 py-4 text-sm">
      {label}
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
