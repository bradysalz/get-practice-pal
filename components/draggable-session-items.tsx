"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteSessionItemAction,
  reorderSessionItemsAction,
  updateSessionItemAction,
} from "@/app/(app)/sessions/actions";
import { DragHandle, Field, TextInput } from "@/components/ui/primitives";

type SessionItemRow = {
  exerciseId: string | null;
  id: string;
  itemType: "exercise" | "song";
  label: string;
  pathLines: string[];
  songId: string | null;
  tempo: number | null;
};

type DraggableSessionItemsProps = {
  items: SessionItemRow[];
  sessionId: string;
};

function SortableSessionRow({
  item,
  order,
  sessionId,
}: {
  item: SessionItemRow;
  order: number;
  sessionId: string;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`list-row flex items-start gap-3 p-4 ${isDragging ? "z-10 opacity-80 shadow-lg" : ""}`}
    >
      <DragHandle
        ref={setActivatorNodeRef}
        label={`Drag ${item.label}`}
        {...attributes}
        {...listeners}
      />
      <div className="flex-1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <SessionItemLabel label={item.label} pathLines={item.pathLines} />
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="grid gap-3 sm:grid-cols-[8rem_auto] sm:items-end">
              <form action={updateSessionItemAction} className="contents">
                <input type="hidden" name="sessionItemId" value={item.id} />
                <input type="hidden" name="sessionId" value={sessionId} />
                <input type="hidden" name="itemType" value={item.itemType} />
                <input type="hidden" name="exerciseId" value={item.exerciseId ?? ""} />
                <input type="hidden" name="songId" value={item.songId ?? ""} />
                <input type="hidden" name="displayOrder" value={String(order)} />
                <Field label="Tempo">
                  <TextInput
                    name="tempo"
                    type="number"
                    min={1}
                    defaultValue={item.tempo ?? ""}
                    onBlur={(event) => {
                      const nextFocus = event.relatedTarget;
                      const isMovingToRemove = nextFocus instanceof HTMLElement
                        ? Boolean(nextFocus.closest(`[data-session-delete-for="${item.id}"]`))
                        : false;

                      if (!isMovingToRemove && event.currentTarget.value !== String(item.tempo ?? "")) {
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                </Field>
              </form>
              <form
                action={deleteSessionItemAction}
                className="sm:mb-[0.15rem]"
                data-session-delete-for={item.id}
              >
                <input type="hidden" name="sessionItemId" value={item.id} />
                <RemoveSessionItemButton label={`Remove ${item.label}`} />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionItemLabel({
  label,
  pathLines,
}: {
  label: string;
  pathLines: string[];
}) {
  const lines = pathLines.length ? pathLines : label.split(/\s+\/\s+/).filter(Boolean);

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

function RemoveSessionItemButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="btn btn-error btn-xs h-7 min-h-0 w-7 px-0"
      aria-label={label}
      title="Remove"
      disabled={pending}
    >
      <span aria-hidden="true" className="text-sm leading-none">{pending ? "…" : "×"}</span>
    </button>
  );
}

export function DraggableSessionItems({
  items,
  sessionId,
}: DraggableSessionItemsProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  function commit(next: SessionItemRow[], previous: SessionItemRow[]) {
    setOrderedItems(next);
    startTransition(async () => {
      try {
        await reorderSessionItemsAction(sessionId, next.map((item) => item.id));
      } catch {
        setOrderedItems(previous);
      }
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
    const newIndex = orderedItems.findIndex((item) => item.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const previous = orderedItems;
    commit(arrayMove(orderedItems, oldIndex, newIndex), previous);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className={`space-y-3 ${isPending ? "opacity-80" : ""}`}>
          {orderedItems.map((item, index) => (
            <SortableSessionRow key={item.id} item={item} order={index} sessionId={sessionId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
