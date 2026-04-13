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
import { deleteSetlistItemAction } from "@/app/(app)/setlists/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { DragHandle } from "@/components/ui/primitives";

type SetlistItemRow = {
  id: string;
  itemType: "exercise" | "song";
  label: string;
};

type DraggableSetlistItemsProps = {
  items: SetlistItemRow[];
  onReorder: (setlistId: string, itemIds: string[], returnPath?: string | null) => Promise<void>;
  returnPath: string;
  setlistId: string;
};

function SortableSetlistRow({
  item,
  returnPath,
}: {
  item: SetlistItemRow;
  returnPath: string;
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
      className={`list-row flex items-center gap-3 p-4 ${isDragging ? "z-10 opacity-80 shadow-lg" : ""}`}
    >
      <DragHandle
        ref={setActivatorNodeRef}
        label={`Drag ${item.label}`}
        {...attributes}
        {...listeners}
      />
      <div className="flex-1">
        <p className="font-medium text-base-content">{item.label}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="chip">{item.itemType === "exercise" ? "Exercise" : "Song"}</span>
        </div>
      </div>
      <form action={deleteSetlistItemAction}>
        <input type="hidden" name="setlistItemId" value={item.id} />
        <input type="hidden" name="returnPath" value={returnPath} />
        <FormSubmitButton
          label="Remove"
          pendingLabel="Removing..."
          className="btn btn-outline btn-xs"
        />
      </form>
    </div>
  );
}

export function DraggableSetlistItems({
  items,
  onReorder,
  returnPath,
  setlistId,
}: DraggableSetlistItemsProps) {
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

  function commit(next: SetlistItemRow[], previous: SetlistItemRow[]) {
    setOrderedItems(next);
    startTransition(async () => {
      try {
        await onReorder(setlistId, next.map((item) => item.id), returnPath);
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
          {orderedItems.map((item) => (
            <SortableSetlistRow key={item.id} item={item} returnPath={returnPath} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
