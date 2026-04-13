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
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

type SectionItem = {
  exerciseCount: number;
  id: string;
  title: string;
};

type DraggableBookSectionsProps = {
  bookId: string;
  onReorder: (bookId: string, sectionIds: string[]) => Promise<void>;
  sections: SectionItem[];
};

function SortableSectionRow({
  bookId,
  section,
}: {
  bookId: string;
  section: SectionItem;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`list-row flex items-center gap-3 p-4 ${isDragging ? "z-10 opacity-80 shadow-lg" : ""}`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="btn btn-ghost btn-sm cursor-grab active:cursor-grabbing"
        aria-label={`Drag ${section.title}`}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <Link
        href={`/library/books/${bookId}/sections/${section.id}`}
        className="flex-1"
      >
        <p className="font-semibold text-base-content">{section.title}</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <span className="chip chip-neutral">
            {section.exerciseCount} exercise{section.exerciseCount === 1 ? "" : "s"}
          </span>
        </div>
      </Link>
    </div>
  );
}

export function DraggableBookSections({
  bookId,
  onReorder,
  sections,
}: DraggableBookSectionsProps) {
  const [orderedSections, setOrderedSections] = useState(sections);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    setOrderedSections(sections);
  }, [sections]);

  function commit(next: SectionItem[], previous: SectionItem[]) {
    setOrderedSections(next);
    startTransition(async () => {
      try {
        await onReorder(bookId, next.map((item) => item.id));
      } catch {
        setOrderedSections(previous);
      }
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = orderedSections.findIndex((item) => item.id === active.id);
    const newIndex = orderedSections.findIndex((item) => item.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const previous = orderedSections;
    commit(arrayMove(orderedSections, oldIndex, newIndex), previous);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedSections.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className={`space-y-4 ${isPending ? "opacity-80" : ""}`}>
          {orderedSections.map((section) => (
            <SortableSectionRow key={section.id} bookId={bookId} section={section} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
