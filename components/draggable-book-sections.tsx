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
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { type RefObject, useEffect, useRef, useState, useTransition } from "react";

type SectionItem = {
  completionLabel?: string;
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
  suppressNavigationRef,
}: {
  bookId: string;
  section: SectionItem;
  suppressNavigationRef: RefObject<boolean>;
}) {
  const {
    attributes,
    isDragging,
    listeners,
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
      className={`list-row min-h-32 cursor-grab p-4 transition-all hover:shadow-[3px_3px_0_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px] active:cursor-grabbing ${isDragging ? "z-10 opacity-80 shadow-lg" : ""}`}
      {...attributes}
      {...listeners}
    >
      <Link
        href={`/library/books/${bookId}/sections/${section.id}`}
        className="block h-full"
        onClickCapture={(event) => {
          if (suppressNavigationRef.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        <p className="font-semibold leading-tight text-base-content">{section.title}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="chip chip-neutral">
            {section.exerciseCount} exercise{section.exerciseCount === 1 ? "" : "s"}
          </span>
          {section.completionLabel ? (
            <span className="chip">{section.completionLabel}</span>
          ) : null}
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
  const suppressNavigationRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
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

    suppressNavigationRef.current = true;
    window.setTimeout(() => {
      suppressNavigationRef.current = false;
    }, 250);

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
      <SortableContext items={orderedSections.map((item) => item.id)} strategy={rectSortingStrategy}>
        <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${isPending ? "opacity-80" : ""}`}>
          {orderedSections.map((section) => (
            <SortableSectionRow
              key={section.id}
              bookId={bookId}
              section={section}
              suppressNavigationRef={suppressNavigationRef}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
