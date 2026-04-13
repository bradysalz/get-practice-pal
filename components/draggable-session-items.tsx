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
import {
  deleteSessionItemAction,
  reorderSessionItemsAction,
  updateSessionItemAction,
} from "@/app/(app)/sessions/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

type SessionItemRow = {
  exerciseId: string | null;
  id: string;
  itemType: "exercise" | "song";
  label: string;
  songId: string | null;
  tempo: number;
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
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="btn btn-ghost btn-sm cursor-grab active:cursor-grabbing"
        aria-label={`Drag ${item.label}`}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="flex-1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="font-medium text-base-content">{item.label}</p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="grid gap-3 sm:grid-cols-[8rem_auto_auto] sm:items-end">
              <form action={updateSessionItemAction} className="contents">
                <input type="hidden" name="sessionId" value={sessionId} />
                <input type="hidden" name="itemType" value={item.itemType} />
                <input type="hidden" name="exerciseId" value={item.exerciseId ?? ""} />
                <input type="hidden" name="songId" value={item.songId ?? ""} />
                <input type="hidden" name="displayOrder" value={String(order)} />
                <label className="form-control w-full">
                  <span className="label-text mb-2 text-sm font-medium text-base-content">Tempo</span>
                  <input
                    className="input app-field w-full"
                    name="tempo"
                    type="number"
                    min={1}
                    defaultValue={item.tempo}
                  />
                </label>
                <FormSubmitButton
                  label="Save"
                  pendingLabel="Saving..."
                  className="btn btn-secondary btn-sm sm:mb-[0.15rem]"
                />
              </form>
              <form action={deleteSessionItemAction} className="sm:mb-[0.15rem]">
                <input type="hidden" name="sessionItemId" value={item.id} />
                <FormSubmitButton
                  label="Remove"
                  pendingLabel="Removing..."
                  className="btn btn-outline btn-xs"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
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
