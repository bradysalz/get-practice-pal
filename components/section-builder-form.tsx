"use client";

import { useMemo, useState } from "react";
import { FormSelect } from "@/components/form-select";
import { Field, PagePanel, Textarea, TextInput } from "@/components/ui/primitives";
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
  const [firstNumber, setFirstNumber] = useState(existingCount + 1);
  const [manualNames, setManualNames] = useState("");

  const previewNames = useMemo(() => {
    if (namingType === "manual") {
      return parseManualNames(manualNames);
    }

    return buildExerciseNames(exerciseCount, namingType, prefix, firstNumber);
  }, [exerciseCount, firstNumber, manualNames, namingType, prefix]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="bookId" value={bookId} />
      {section ? <input type="hidden" name="sectionId" value={section.id} /> : null}
      <input type="hidden" name="existingExerciseCount" value={existingCount} />
      <input type="hidden" name="position" value={String(section?.position ?? 1)} />

      <PagePanel className="p-5">
        <div className="grid gap-4">
          <Field label="Section title">
            <TextInput
              name="title"
              defaultValue={section?.title ?? ""}
              placeholder="Triplet Grid"
            />
          </Field>
          <Field label="Default goal tempo">
            <TextInput
              name="defaultGoalTempo"
              type="number"
              min={1}
              defaultValue={section?.default_goal_tempo ?? ""}
              placeholder="132"
            />
          </Field>
        </div>
      </PagePanel>

      <PagePanel className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/50">
              Exercise Pattern
            </p>
          </div>
          <div className="chip chip-neutral ">
            Existing exercises: {existingCount}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {namingType === "manual" ? (
            <input type="hidden" name="exerciseCount" value={String(previewNames.length)} />
          ) : null}
          <Field label="New exercises">
            <TextInput
              name="exerciseCount"
              type="number"
              min={0}
              value={exerciseCount}
              onChange={(event) => setExerciseCount(Number(event.target.value) || 0)}
              disabled={namingType === "manual"}
            />
          </Field>
          <Field label="First #">
            <TextInput
              name="exerciseStartNumber"
              type="number"
              min={1}
              value={firstNumber}
              onChange={(event) => setFirstNumber(Number(event.target.value) || 1)}
              disabled={namingType === "manual"}
            />
          </Field>
          <FormSelect
            label="Naming"
            name="namingType"
            defaultValue={namingType}
            onChange={(value) => setNamingType(value as ExerciseNamingType)}
            options={[
              { value: "numeric", label: "1, 2, 3..." },
              { value: "alpha", label: "A, B, C..." },
              { value: "roman", label: "I, II, III..." },
              { value: "manual", label: "Manual names" },
            ]}
          />
          <Field label="Prefix">
            <TextInput
              name="exercisePrefix"
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
              placeholder="Exercise"
              disabled={namingType === "manual"}
            />
          </Field>
        </div>

        {namingType === "manual" ? (
          <div className="mt-4">
            <Field label="Exercise names">
              <Textarea
                name="manualExerciseNames"
                value={manualNames}
                onChange={(event) => setManualNames(event.target.value)}
                placeholder={"Warmup\nTriplets\nChromatic shifts"}
                rows={5}
              />
            </Field>
          </div>
        ) : null}

        <div className="mt-5 border-2 border-base-300 bg-base-200 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/50">
            Preview
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {previewNames.length ? (
              previewNames.slice(0, 6).map((name) => (
                <span key={name} className="chip chip-neutral ">
                  {name}
                </span>
              ))
            ) : null}
            {previewNames.length > 6 ? (
              <span className="chip chip-neutral ">+{previewNames.length - 6} more</span>
            ) : null}
          </div>
        </div>
      </PagePanel>

      <button className="btn btn-primary" type="submit">
        {mode === "create" ? "Create section" : "Save section"}
      </button>
    </form>
  );
}

function parseManualNames(value: string) {
  return value
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}
