"use client";

import Link from "next/link";
import { useState } from "react";
import { reorderSectionExercisesAction } from "@/app/(app)/library/actions";
import { DraggableSectionExercises } from "@/components/draggable-section-exercises";
import { SectionHeroEditor } from "@/components/section-hero-editor";
import { EmptyState, PageHero, PagePanel, StatCard } from "@/components/ui/primitives";

type SectionExerciseItem = {
  goalTempo: number | null;
  href: string;
  id: string;
  maxTempo: number;
  position: number;
  title: string;
};

export function SectionDetailShell({
  bookId,
  bookTitle,
  completionPercent,
  defaultGoalTempo,
  exercises,
  sectionId,
  sectionPosition,
  sectionTitle,
}: {
  bookId: string;
  bookTitle: string;
  completionPercent: number;
  defaultGoalTempo: number | null;
  exercises: SectionExerciseItem[];
  sectionId: string;
  sectionPosition: number;
  sectionTitle: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <PageHero
        backHref={`/library/books/${bookId}`}
        backLabel={
          <>
            Back to <em className="normal-case">{bookTitle}</em>
          </>
        }
        eyebrow="Section"
        title=""
        stats={
          <div className="grid grid-cols-2 gap-2 md:min-w-[14rem] md:gap-3">
            <StatCard compact label="Exercises" value={String(exercises.length)} />
            <StatCard compact label="Completion" value={`${completionPercent}%`} />
          </div>
        }
      >
        <SectionHeroEditor
          bookId={bookId}
          onEditingChange={setIsEditing}
          section={{
            id: sectionId,
            title: sectionTitle,
            position: sectionPosition,
            default_goal_tempo: defaultGoalTempo,
            exercises: exercises.map((exercise) => ({
              id: exercise.id,
              title: exercise.title,
              position: exercise.position,
              goal_tempo: exercise.goalTempo,
            })),
          }}
          title={sectionTitle}
        />
      </PageHero>

      <section className="space-y-6">
        <PagePanel>
          <div>
            <h2 className="text-lg font-bold text-primary">Current Exercises</h2>
          </div>
          <div className="mt-5 space-y-3">
            {exercises.length ? (
              isEditing ? (
                <div className="space-y-3">
                  <p className="text-sm text-base-content/70">Drag exercises by the handle while section editing is open.</p>
                  <DraggableSectionExercises
                    exercises={exercises}
                    onReorder={reorderSectionExercisesAction}
                    sectionId={sectionId}
                  />
                </div>
              ) : (
                exercises.map((exercise) => (
                  <Link
                    key={exercise.id}
                    href={exercise.href}
                    className="list-row block p-4 transition-all hover:shadow-[3px_3px_0_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium text-base-content">{exercise.title}</p>
                      <div className="flex flex-wrap gap-2">
                        {exercise.goalTempo ? <span className="chip">Goal {exercise.goalTempo} BPM</span> : null}
                        <span className="chip chip-neutral">Max {exercise.maxTempo} BPM</span>
                      </div>
                    </div>
                  </Link>
                ))
              )
            ) : (
              <EmptyState label="No exercises yet for this section." />
            )}
          </div>
        </PagePanel>
      </section>
    </div>
  );
}
