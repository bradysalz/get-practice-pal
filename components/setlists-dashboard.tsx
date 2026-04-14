import Link from "next/link";
import {
  addSetlistItemAction,
  createSetlistAction,
  reorderSetlistItemsAction,
} from "@/app/(app)/setlists/actions";
import { ActionModal } from "@/components/action-modal";
import { DraggableSetlistItems } from "@/components/draggable-setlist-items";
import { FormSelect } from "@/components/form-select";
import { SetlistHeroEditor } from "@/components/setlist-hero-editor";
import {
  CardForm,
  SectionHeader,
} from "@/components/library-manager";
import {
  CardLink,
  EmptyState,
  Field,
  PageHero,
  PagePanel,
  StatCard,
  TextInput,
  Textarea,
} from "@/components/ui/primitives";
import type { LibrarySnapshot } from "@/lib/data/library";
import { buildLibraryItemMaps } from "@/lib/data/view-models";

type SetlistsDashboardProps = {
  snapshot: LibrarySnapshot;
};

export function SetlistsDashboard({ snapshot }: SetlistsDashboardProps) {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Setlists"
        title=""
        stats={
          <div className="grid grid-cols-2 gap-3 md:min-w-[18rem]">
            <StatCard label="Setlists" value={String(snapshot.setlists.length)} />
            <StatCard
              label="Items"
              value={String(snapshot.setlists.reduce((sum, setlist) => sum + (setlist.items?.length ?? 0), 0))}
            />
          </div>
        }
      />

      <section className="space-y-6">
        <PagePanel>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionHeader title="Create" />
            <ActionModal triggerLabel="Add setlist" submitFormId="create-setlist-form" submitLabel="Save">
              <CreateSetlistForm />
            </ActionModal>
          </div>
        </PagePanel>

        <PagePanel>
          <SectionHeader title="Saved Setlists" />
          <div className="mt-5 space-y-3">
            {snapshot.setlists.length ? (
              snapshot.setlists.map((setlist) => (
                <CardLink key={setlist.id} href={`/setlists/${setlist.id}`}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-base-content">{setlist.name}</h2>
                      {setlist.description ? (
                        <p className="mt-2 text-sm text-base-content/65">{setlist.description}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="chip chip-neutral">
                          {(setlist.items?.length ?? 0)} item{(setlist.items?.length ?? 0) === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wide text-primary">Open</span>
                  </div>
                </CardLink>
              ))
            ) : (
              <EmptyState label="No setlists yet." />
            )}
          </div>
        </PagePanel>
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
      <PageHero
        backHref="/setlists"
        backLabel="Back to setlists"
        eyebrow="Setlist"
        title=""
        stats={
          <div className="grid grid-cols-1 gap-3 md:min-w-[12rem]">
            <StatCard label="Items" value={String(sortedItems.length)} />
          </div>
        }
      >
        <SetlistHeroEditor setlist={setlist} />
      </PageHero>

      <section className="space-y-6">
        <PagePanel>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SectionHeader title="Items" />
            <div className="flex flex-wrap gap-3">
              <ActionModal
                triggerLabel="Add item"
                submitFormId="add-setlist-item-form"
                submitLabel="Add item"
                submitClassName="btn btn-accent"
              >
                <AddSetlistItemForm setlist={setlist} itemOptions={itemOptions} />
              </ActionModal>
              <Link href="/sessions" className="btn btn-outline">
                Use in sessions
              </Link>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {sortedItems.length ? (
              <DraggableSetlistItems
                items={sortedItems.map((item) => ({
                  id: item.id,
                  itemType: item.item_type,
                  label: labelSetlistItem(item, itemMaps),
                }))}
                onReorder={reorderSetlistItemsAction}
                returnPath={`/setlists/${setlist.id}`}
                setlistId={setlist.id}
              />
            ) : (
              <EmptyState label="No items." />
            )}
          </div>
        </PagePanel>
      </section>
    </div>
  );
}

function CreateSetlistForm() {
  return (
    <form id="create-setlist-form" action={createSetlistAction}>
      <CardForm surface="plain">
        <Field label="Name">
          <TextInput name="name" placeholder="Warm-up block" />
        </Field>
        <Field label="Description">
          <Textarea
            className="min-h-28"
            name="description"
            placeholder="Hands, rudiments, then tunes."
          />
        </Field>
      </CardForm>
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
    <form id="add-setlist-item-form" action={addSetlistItemAction}>
      <input type="hidden" name="setlistId" value={setlist.id} />
      <input type="hidden" name="returnPath" value={`/setlists/${setlist.id}`} />
      <input type="hidden" name="position" value={String((setlist.items?.length ?? 0) + 1)} />
      <CardForm surface="plain">
        <FormSelect
          label="Library item"
          name="itemKey"
          emptyLabel="Select exercise or song"
          options={itemOptions}
        />
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
