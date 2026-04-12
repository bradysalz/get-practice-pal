import Link from "next/link";
import {
  addSetlistItemAction,
  createSetlistAction,
  deleteSetlistItemAction,
  updateSetlistAction,
} from "@/app/(app)/setlists/actions";
import { ActionModal } from "@/components/action-modal";
import { FormSelect } from "@/components/form-select";
import { FormSubmitButton } from "@/components/form-submit-button";
import {
  CardForm,
  EmptyBox,
  SectionHeader,
  StatCard,
} from "@/components/library-manager";
import type { LibrarySnapshot } from "@/lib/data/library";
import { buildLibraryItemMaps } from "@/lib/data/view-models";

type SetlistsDashboardProps = {
  snapshot: LibrarySnapshot;
};

export function SetlistsDashboard({ snapshot }: SetlistsDashboardProps) {
  return (
    <div className="space-y-6">
      <section className="page-hero p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Setlists</p>
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              Plan what you want to practice.
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 md:min-w-[18rem]">
            <StatCard label="Setlists" value={String(snapshot.setlists.length)} />
            <StatCard
              label="Items"
              value={String(snapshot.setlists.reduce((sum, setlist) => sum + (setlist.items?.length ?? 0), 0))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <section className="page-panel p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionHeader title="Create" />
            <ActionModal title="Add setlist" triggerLabel="Add setlist">
              <CreateSetlistForm />
            </ActionModal>
          </div>
        </section>

        <section className="page-panel p-6">
          <SectionHeader title="Saved Setlists" />
          <div className="mt-5 space-y-3">
            {snapshot.setlists.length ? (
              snapshot.setlists.map((setlist) => (
                <Link
                  key={setlist.id}
                  href={`/setlists/${setlist.id}`}
                  className="accent-card block p-5 transition hover:border-primary/25 hover:bg-red-50/35"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-base-content">{setlist.name}</h2>
                      {setlist.description ? (
                        <p className="mt-2 text-sm text-base-content/65">{setlist.description}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="chip chip-neutral text-[0.72rem]">
                          {(setlist.items?.length ?? 0)} item{(setlist.items?.length ?? 0) === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-primary">Open</span>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyBox label="No setlists yet. Add your first setlist." />
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

export function SetlistDetailPage({
  setlist,
  snapshot,
}: {
  setlist: NonNullable<LibrarySnapshot["setlists"]>[number];
  snapshot: LibrarySnapshot;
}) {
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

  const sortedItems = (setlist.items ?? []).slice().sort((left, right) => left.position - right.position);

  return (
    <div className="space-y-6">
      <section className="page-hero p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <Link href="/setlists" className="text-sm font-medium text-primary">
              Back to setlists
            </Link>
            <p className="eyebrow mt-4">Setlist</p>
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              {setlist.name}
            </h1>
            {setlist.description ? (
              <p className="mt-3 text-sm text-base-content/65">{setlist.description}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-3 md:min-w-[12rem]">
            <StatCard label="Items" value={String(sortedItems.length)} />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <section className="page-panel p-6">
          <EditSetlistForm setlist={setlist} />
        </section>

        <section className="page-panel p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionHeader title="Items" />
            <div className="flex flex-wrap gap-3">
              <ActionModal title="Add item" triggerLabel="Add item">
                <AddSetlistItemForm setlist={setlist} itemOptions={itemOptions} />
              </ActionModal>
              <Link href="/sessions" className="btn btn-ghost border border-base-300">
                Use in sessions
              </Link>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {sortedItems.length ? (
              sortedItems.map((item) => (
                <div key={item.id} className="accent-card flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium text-base-content">{labelSetlistItem(item, itemMaps)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="chip chip-neutral text-[0.72rem]">Position {item.position}</span>
                      <span className="chip text-[0.72rem]">
                        {item.item_type === "exercise" ? "Exercise" : "Song"}
                      </span>
                    </div>
                  </div>
                  <form action={deleteSetlistItemAction}>
                    <input type="hidden" name="setlistItemId" value={item.id} />
                    <input type="hidden" name="returnPath" value={`/setlists/${setlist.id}`} />
                    <FormSubmitButton
                      label="Remove"
                      pendingLabel="Removing..."
                      className="btn btn-ghost btn-xs border border-base-300"
                    />
                  </form>
                </div>
              ))
            ) : (
              <EmptyBox label="No items yet." />
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function CreateSetlistForm() {
  return (
    <form action={createSetlistAction}>
      <CardForm title="Add setlist">
        <label className="form-control w-full">
          <span className="label-text mb-2 text-sm font-medium text-base-content">Name</span>
          <input className="input input-bordered w-full" name="name" placeholder="Warm-up block" />
        </label>
        <label className="form-control w-full">
          <span className="label-text mb-2 text-sm font-medium text-base-content">Description</span>
          <textarea
            className="textarea textarea-bordered min-h-28 w-full"
            name="description"
            placeholder="Hands, rudiments, then tunes."
          />
        </label>
        <FormSubmitButton label="Create setlist" pendingLabel="Creating..." />
      </CardForm>
    </form>
  );
}

function EditSetlistForm({
  setlist,
}: {
  setlist: NonNullable<LibrarySnapshot["setlists"]>[number];
}) {
  return (
    <form action={updateSetlistAction} className="max-w-3xl space-y-4">
      <input type="hidden" name="setlistId" value={setlist.id} />
      <input type="hidden" name="returnPath" value={`/setlists/${setlist.id}`} />
      <input
        className="w-full border-0 bg-transparent p-0 font-display text-3xl font-semibold tracking-tight text-base-content outline-none md:text-4xl"
        name="name"
        defaultValue={setlist.name}
      />
      <textarea
        className="textarea w-full"
        name="description"
        defaultValue={setlist.description ?? ""}
        placeholder="Description"
      />
      <FormSubmitButton label="Save" pendingLabel="Saving..." className="btn btn-secondary btn-sm" />
    </form>
  );
}

function AddSetlistItemForm({
  itemOptions,
  setlist,
}: {
  itemOptions: Array<{ value: string; label: string }>;
  setlist: NonNullable<LibrarySnapshot["setlists"]>[number];
}) {
  return (
    <form action={addSetlistItemAction}>
      <input type="hidden" name="setlistId" value={setlist.id} />
      <input type="hidden" name="returnPath" value={`/setlists/${setlist.id}`} />
      <CardForm title="Add item">
        <FormSelect
          label="Library item"
          name="itemKey"
          emptyLabel="Select exercise or song"
          options={itemOptions}
        />
        <label className="form-control w-full">
          <span className="label-text mb-2 text-sm font-medium text-base-content">Position</span>
          <input
            className="input input-bordered w-full"
            name="position"
            type="number"
            min={1}
            defaultValue={(setlist.items?.length ?? 0) + 1}
          />
        </label>
        <FormSubmitButton label="Add item" pendingLabel="Adding..." className="btn btn-accent btn-sm" />
      </CardForm>
    </form>
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
