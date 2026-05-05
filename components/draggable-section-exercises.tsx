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
import { DragHandle } from "@/components/ui/primitives";

type ExerciseItem = {
  goalTempo: number | null;
  href: string;
  id: string;
  maxTempo: number;
  title: string;
};

type DraggableSectionExercisesProps = {
  exercises: ExerciseItem[];
  onReorder: (sectionId: string, exerciseIds: string[]) => Promise<void>;
  sectionId: string;
};

function SortableExerciseRow({
  exercise,
  suppressNavigationRef,
}: {
  exercise: ExerciseItem;
  suppressNavigationRef: RefObject<boolean>;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: exercise.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`list-row p-4 transition-all hover:shadow-[3px_3px_0_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px] ${isDragging ? "z-10 opacity-80 shadow-lg" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <Link
          href={exercise.href}
          className="block min-w-0 flex-1"
          onClickCapture={(event) => {
            if (suppressNavigationRef.current) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium text-base-content">{exercise.title}</p>
            <div className="flex flex-wrap gap-2">
              {exercise.goalTempo ? <span className="chip">Goal {exercise.goalTempo} BPM</span> : null}
              <span className="chip chip-neutral">Max {exercise.maxTempo} BPM</span>
            </div>
          </div>
        </Link>
        <DragHandle
          label={`Reorder ${exercise.title}`}
          {...attributes}
          {...listeners}
        />
      </div>
    </div>
  );
}

export function DraggableSectionExercises({
  exercises,
  onReorder,
  sectionId,
}: DraggableSectionExercisesProps) {
  const [orderedExercises, setOrderedExercises] = useState(exercises);
  const [isPending, startTransition] = useTransition();
  const suppressNavigationRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    setOrderedExercises(exercises);
  }, [exercises]);

  function commit(next: ExerciseItem[], previous: ExerciseItem[]) {
    setOrderedExercises(next);
    startTransition(async () => {
      try {
        await onReorder(sectionId, next.map((item) => item.id));
      } catch {
        setOrderedExercises(previous);
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

    const oldIndex = orderedExercises.findIndex((item) => item.id === active.id);
    const newIndex = orderedExercises.findIndex((item) => item.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const previous = orderedExercises;
    commit(arrayMove(orderedExercises, oldIndex, newIndex), previous);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedExercises.map((item) => item.id)} strategy={rectSortingStrategy}>
        <div className={`space-y-3 ${isPending ? "opacity-80" : ""}`}>
          {orderedExercises.map((exercise) => (
            <SortableExerciseRow
              key={exercise.id}
              exercise={exercise}
              suppressNavigationRef={suppressNavigationRef}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
