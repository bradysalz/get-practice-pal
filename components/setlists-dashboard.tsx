import Link from "next/link";
import {
  addSetlistItemAction,
  createSetlistAction,
  deleteSetlistItemAction,
  updateSetlistAction,
} from "@/app/(app)/setlists/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { LibrarySnapshot } from "@/lib/data/library";
import { buildLibraryItemMaps } from "@/lib/data/view-models";

type SetlistsDashboardProps = {
  snapshot: LibrarySnapshot;
};

export function SetlistsDashboard({ snapshot }: SetlistsDashboardProps) {
  const itemMaps = buildLibraryItemMaps(snapshot);
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
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">Setlists</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              Plan sessions before the clock starts.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-base-content/75 md:text-base">
              Setlists are now real backend records. Build ordered practice plans from exercises and songs,
              then launch a session from them on the Sessions page.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-base-200/70 px-5 py-4 text-sm text-base-content/75">
            {snapshot.setlists.length} saved setlist{snapshot.setlists.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-base-300/70 bg-base-100/85 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-base-content">Manage setlists</h2>
            <div className="mt-5 space-y-4">
              {snapshot.setlists.length ? (
                snapshot.setlists.map((setlist) => (
                  <details key={setlist.id} className="rounded-[1.5rem] border border-base-300/70 bg-base-200/50 p-5" open>
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-base-content">{setlist.name}</h3>
                          <p className="text-sm text-base-content/65">
                            {setlist.description || "No description"} · {(setlist.items ?? []).length} item
                            {(setlist.items ?? []).length === 1 ? "" : "s"}
                          </p>
                        </div>
                        <Link href="/sessions" className="btn btn-ghost btn-sm border border-base-300">
                          Start in Sessions
                        </Link>
                      </div>
                    </summary>
                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                      <form action={updateSetlistAction} className="rounded-[1.25rem] border border-base-300/70 bg-base-100 p-4">
                        <input type="hidden" name="setlistId" value={setlist.id} />
                        <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-base-content/60">
                          Edit setlist
                        </h4>
                        <div className="mt-4 space-y-3">
                          <label className="form-control w-full">
                            <span className="label-text mb-2 text-sm font-medium text-base-content">Name</span>
                            <input className="input input-bordered w-full" name="name" defaultValue={setlist.name} />
                          </label>
                          <label className="form-control w-full">
                            <span className="label-text mb-2 text-sm font-medium text-base-content">Description</span>
                            <textarea
                              className="textarea textarea-bordered min-h-24 w-full"
                              name="description"
                              defaultValue={setlist.description ?? ""}
                            />
                          </label>
                          <FormSubmitButton label="Save setlist" pendingLabel="Saving..." className="btn btn-secondary btn-sm" />
                        </div>
                      </form>

                      <form action={addSetlistItemAction} className="rounded-[1.25rem] border border-base-300/70 bg-base-100 p-4">
                        <input type="hidden" name="setlistId" value={setlist.id} />
                        <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-base-content/60">
                          Add item
                        </h4>
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
                          <label className="form-control w-full">
                            <span className="label-text mb-2 text-sm font-medium text-base-content">Position</span>
                            <input
                              className="input input-bordered w-full"
                              name="position"
                              type="number"
                              min={0}
                              defaultValue={(setlist.items?.length ?? 0) + 1}
                            />
                          </label>
                          <FormSubmitButton label="Add item" pendingLabel="Adding..." className="btn btn-accent btn-sm" />
                        </div>
                      </form>
                    </div>

                    <div className="mt-4 space-y-3">
                      {(setlist.items ?? []).length ? (
                        setlist.items
                          .slice()
                          .sort((left, right) => left.position - right.position)
                          .map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-3 rounded-[1rem] bg-base-100 p-4 shadow-sm">
                              <div>
                                <p className="font-medium text-base-content">{labelSetlistItem(item, itemMaps)}</p>
                                <p className="text-sm text-base-content/65">Position {item.position}</p>
                              </div>
                              <form action={deleteSetlistItemAction}>
                                <input type="hidden" name="setlistItemId" value={item.id} />
                                <FormSubmitButton
                                  label="Remove"
                                  pendingLabel="Removing..."
                                  className="btn btn-ghost btn-xs border border-base-300"
                                />
                              </form>
                            </div>
                          ))
                      ) : (
                        <EmptyBox label="No items yet. Add exercises and songs to build the plan." />
                      )}
                    </div>
                  </details>
                ))
              ) : (
                <EmptyBox label="No setlists yet. Create one from the sidebar form." />
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-base-300/70 bg-base-100/85 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-base-content">Create setlist</h2>
            <form action={createSetlistAction} className="mt-4 space-y-3">
              <label className="form-control w-full">
                <span className="label-text mb-2 text-sm font-medium text-base-content">Name</span>
                <input className="input input-bordered w-full" name="name" placeholder="Warm-up block" />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-2 text-sm font-medium text-base-content">Description</span>
                <textarea className="textarea textarea-bordered min-h-28 w-full" name="description" placeholder="Hands, rudiments, then tunes." />
              </label>
              <FormSubmitButton label="Create setlist" pendingLabel="Creating..." />
            </form>
          </section>

          <section className="rounded-[1.75rem] border border-dashed border-secondary/35 bg-secondary/8 p-6">
            <h2 className="text-lg font-semibold text-base-content">Ready for sessions</h2>
            <p className="mt-3 text-sm leading-6 text-base-content/75">
              Once a setlist exists, the Sessions page can start a session using it as the source, and you
              can still add more items while practicing.
            </p>
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

function labelSetlistItem(
  item: { item_type: "exercise" | "song"; exercise_id: string | null; song_id: string | null },
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
