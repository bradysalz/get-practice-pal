"use client";

import { useMemo, useState } from "react";
import { FormSelect } from "@/components/form-select";
import type { ExerciseNamingType } from "@/lib/section-builder";
import { buildExerciseNames } from "@/lib/section-builder";

type SectionBuilderFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  bookId: string;
  mode: "create" | "edit";
  section?: {
    id: string;
    title: string;
    position: number;
    default_goal_tempo: number | null;
    exercises?: Array<{
      id: string;
      title: string;
      position: number;
      goal_tempo: number | null;
    }>;
  };
};

export function SectionBuilderForm({
  action,
  bookId,
  mode,
  section,
}: SectionBuilderFormProps) {
  const existingCount = section?.exercises?.length ?? 0;
  const [exerciseCount, setExerciseCount] = useState(existingCount || 4);
  const [namingType, setNamingType] = useState<ExerciseNamingType>("numeric");
  const [prefix, setPrefix] = useState("Exercise");

  const previewNames = useMemo(
    () => buildExerciseNames(exerciseCount, namingType, prefix),
    [exerciseCount, namingType, prefix],
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="bookId" value={bookId} />
      {section ? <input type="hidden" name="sectionId" value={section.id} /> : null}
      <input type="hidden" name="existingExerciseCount" value={existingCount} />

      <div className="page-panel p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-control w-full">
            <span className="label-text mb-2 text-sm font-medium text-base-content">Section title</span>
            <input
              className="input input-bordered w-full"
              name="title"
              defaultValue={section?.title ?? ""}
              placeholder="Triplet Grid"
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text mb-2 text-sm font-medium text-base-content">Position</span>
            <input
              className="input input-bordered w-full"
              name="position"
              type="number"
              min={1}
              defaultValue={section?.position ?? 1}
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text mb-2 text-sm font-medium text-base-content">Default goal tempo</span>
            <input
              className="input input-bordered w-full"
              name="defaultGoalTempo"
              type="number"
              min={1}
              defaultValue={section?.default_goal_tempo ?? ""}
              placeholder="132"
            />
          </label>
        </div>
      </div>

      <div className="page-panel p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50">
              Exercise Pattern
            </p>
          </div>
          <div className="chip chip-neutral text-[0.72rem]">
            Existing exercises: {existingCount}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="form-control w-full">
            <span className="label-text mb-2 text-sm font-medium text-base-content">New exercises</span>
            <input
              className="input input-bordered w-full"
              name="exerciseCount"
              type="number"
              min={0}
              value={exerciseCount}
              onChange={(event) => setExerciseCount(Number(event.target.value) || 0)}
            />
          </label>
          <FormSelect
            label="Enumeration"
            name="namingType"
            defaultValue={namingType}
            onChange={(value) => setNamingType(value as ExerciseNamingType)}
            options={[
              { value: "numeric", label: "1, 2, 3..." },
              { value: "alpha", label: "A, B, C..." },
              { value: "roman", label: "I, II, III..." },
            ]}
          />
          <label className="form-control w-full">
            <span className="label-text mb-2 text-sm font-medium text-base-content">Prefix</span>
            <input
              className="input input-bordered w-full"
              name="exercisePrefix"
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
              placeholder="Exercise"
            />
          </label>
        </div>

        <div className="mt-5 rounded-[1rem] border border-base-300/70 bg-base-200/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">
            Preview
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {previewNames.length ? (
              previewNames.slice(0, 6).map((name) => (
                <span key={name} className="chip chip-neutral text-[0.72rem]">
                  {name}
                </span>
              ))
            ) : null}
            {previewNames.length > 6 ? (
              <span className="chip chip-neutral text-[0.72rem]">+{previewNames.length - 6} more</span>
            ) : null}
          </div>
        </div>
      </div>

      <button className="btn btn-primary" type="submit">
        {mode === "create" ? "Create section" : "Save section"}
      </button>
    </form>
  );
}
