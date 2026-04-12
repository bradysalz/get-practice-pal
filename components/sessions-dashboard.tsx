import {
  addSessionItemAction,
  deleteSessionItemAction,
  endSessionAction,
  pauseSessionAction,
  resumeSessionAction,
  startSessionAction,
  updateSessionNotesAction,
} from "@/app/(app)/sessions/actions";
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
      <section className="rounded-[2rem] border border-base-300/70 bg-base-100/85 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">Sessions</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              Start fast, log clearly, edit later.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-base-content/75 md:text-base">
              Sessions now run against the real backend. You can start from scratch or from a setlist,
              attach exercises and songs, update tempos, and close the session with notes.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-base-200/70 px-5 py-4 text-sm text-base-content/75">
            {currentSession ? "An active session is in progress." : "No active session right now."}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          {currentSession ? (
            <section className="rounded-[1.75rem] border border-primary/20 bg-base-100/85 p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
                    Active Session
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-base-content">
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
                      <FormSubmitButton label="Pause" pendingLabel="Pausing..." className="btn btn-ghost border border-base-300" />
                    </form>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4 rounded-[1.5rem] bg-base-200/55 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-base-content/60">
                    Logged Items
                  </h3>
                  {currentSession.session_items?.length ? (
                    currentSession.session_items
                      .slice()
                      .sort((left, right) => left.display_order - right.display_order)
                      .map((item) => (
                        <div key={item.id} className="rounded-[1rem] bg-base-100 p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-base-content">{labelSessionItem(item, itemMaps)}</p>
                              <p className="text-sm text-base-content/65">{item.tempo} BPM</p>
                            </div>
                            <form action={deleteSessionItemAction}>
                              <input type="hidden" name="sessionItemId" value={item.id} />
                              <FormSubmitButton
                                label="Remove"
                                pendingLabel="Removing..."
                                className="btn btn-ghost btn-xs border border-base-300"
                              />
                            </form>
                          </div>
                        </div>
                      ))
                  ) : (
                    <EmptyBox label="No exercises or songs logged yet." />
                  )}
                </div>

                <div className="space-y-4">
                  <form action={addSessionItemAction} className="rounded-[1.5rem] border border-base-300/70 bg-base-100 p-4">
                    <input type="hidden" name="sessionId" value={currentSession.id} />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-base-content/60">
                      Add item and tempo
                    </h3>
                    <div className="mt-4 space-y-3">
                      <label className="form-control w-full">
                        <span className="label-text mb-2 text-sm font-medium text-base-content">Library item</span>
                        <select className="select select-bordered w-full" name="itemKey" defaultValue="">
                          <option disabled value="">
                            Select exercise or song
                          </option>
                          {itemOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="form-control w-full">
                          <span className="label-text mb-2 text-sm font-medium text-base-content">Tempo</span>
                          <input className="input input-bordered w-full" name="tempo" type="number" min={1} />
                        </label>
                        <label className="form-control w-full">
                          <span className="label-text mb-2 text-sm font-medium text-base-content">Display order</span>
                          <input
                            className="input input-bordered w-full"
                            name="displayOrder"
                            type="number"
                            min={0}
                            defaultValue={currentSession.session_items?.length ?? 0}
                          />
                        </label>
                      </div>
                      <FormSubmitButton label="Log item" pendingLabel="Logging..." />
                    </div>
                  </form>

                  <form action={updateSessionNotesAction} className="rounded-[1.5rem] border border-base-300/70 bg-base-100 p-4">
                    <input type="hidden" name="sessionId" value={currentSession.id} />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-base-content/60">
                      Session notes
                    </h3>
                    <textarea
                      className="textarea textarea-bordered mt-4 min-h-32 w-full"
                      name="notes"
                      defaultValue={currentSession.notes ?? ""}
                      placeholder="How did the session feel?"
                    />
                    <div className="mt-3">
                      <FormSubmitButton label="Save notes" pendingLabel="Saving..." className="btn btn-secondary btn-sm" />
                    </div>
                  </form>

                  <form action={endSessionAction} className="rounded-[1.5rem] border border-error/20 bg-error/5 p-4">
                    <input type="hidden" name="sessionId" value={currentSession.id} />
                    <input type="hidden" name="notes" value={currentSession.notes ?? ""} />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-base-content/60">
                      End session
                    </h3>
                    <p className="mt-2 text-sm text-base-content/70">
                      Ends the active session and preserves the latest saved notes.
                    </p>
                    <div className="mt-4">
                      <FormSubmitButton label="End session" pendingLabel="Ending..." className="btn btn-error btn-sm" />
                    </div>
                  </form>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-[1.75rem] border border-base-300/70 bg-base-100/85 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-base-content">Start a session</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-base-content/75">
                Start with a blank session or use a setlist as the starting point. You can still add more
                items once the session is active.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <form action={startSessionAction} className="rounded-[1.5rem] border border-base-300/70 bg-base-200/50 p-4">
                  <h3 className="font-medium text-base-content">Start from scratch</h3>
                  <p className="mt-2 text-sm text-base-content/70">
                    Opens a session immediately with no starting setlist.
                  </p>
                  <div className="mt-4">
                    <FormSubmitButton label="Start blank session" pendingLabel="Starting..." />
                  </div>
                </form>
                <form action={startSessionAction} className="rounded-[1.5rem] border border-base-300/70 bg-base-200/50 p-4">
                  <h3 className="font-medium text-base-content">Start from setlist</h3>
                  <p className="mt-2 text-sm text-base-content/70">
                    Use one of your saved setlists as the source for the session.
                  </p>
                  <label className="form-control mt-4 w-full">
                    <span className="label-text mb-2 text-sm font-medium text-base-content">Setlist</span>
                    <select className="select select-bordered w-full" name="sourceSetlistId" defaultValue="">
                      <option value="">No setlist selected</option>
                      {librarySnapshot.setlists.map((setlist) => (
                        <option key={setlist.id} value={setlist.id}>
                          {setlist.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="mt-4">
                    <FormSubmitButton label="Start from setlist" pendingLabel="Starting..." />
                  </div>
                </form>
              </div>
            </section>
          )}

          <section className="rounded-[1.75rem] border border-base-300/70 bg-base-100/85 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-base-content">Recent sessions</h2>
            <div className="mt-5 space-y-3">
              {recentSessions.length ? (
                recentSessions.map((session) => (
                  <div key={session.id} className="rounded-[1.25rem] bg-base-200/55 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium text-base-content">{formatDateTime(session.started_at)}</p>
                        <p className="text-sm text-base-content/65">
                          {session.ended_at ? `Ended ${formatDateTime(session.ended_at)}` : "Still active"}
                        </p>
                      </div>
                      <span className="badge badge-outline">
                        {(session.session_items?.length ?? 0)} item{(session.session_items?.length ?? 0) === 1 ? "" : "s"}
                      </span>
                    </div>
                    {session.notes ? (
                      <p className="mt-3 text-sm leading-6 text-base-content/75">{session.notes}</p>
                    ) : null}
                    {session.session_items?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {session.session_items
                          .slice()
                          .sort((left, right) => left.display_order - right.display_order)
                          .map((item) => (
                            <span key={item.id} className="badge badge-neutral badge-outline">
                              {labelSessionItem(item, itemMaps)} · {item.tempo}
                            </span>
                          ))}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyBox label="No session history yet." />
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-base-300/70 bg-base-100/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-base-content">Available material</h2>
            <p className="mt-2 text-sm leading-6 text-base-content/75">
              Sessions pull from your library. Add more books, exercises, artists, and songs from the Library page.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCard label="Books" value={String(librarySnapshot.books.length)} />
              <StatCard
                label="Exercises"
                value={String(Array.from(itemMaps.exerciseMap.keys()).length)}
              />
              <StatCard label="Setlists" value={String(librarySnapshot.setlists.length)} />
              <StatCard label="Songs" value={String(Array.from(itemMaps.songMap.keys()).length)} />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function EmptyBox({ label }: { label: string }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-base-300 bg-base-100 px-4 py-4 text-sm text-base-content/65">
      {label}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-base-200/70 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-base-content">{value}</p>
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
