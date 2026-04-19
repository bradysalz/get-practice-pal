"use client";

import { useState } from "react";
import { deleteSectionAction, saveSectionBuilderAction } from "@/app/(app)/library/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SectionBuilderForm } from "@/components/section-builder-form";

type SectionHeroEditorProps = {
  bookId: string;
  title: string;
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

export function SectionHeroEditor({ bookId, section, title }: SectionHeroEditorProps) {
  const [isEditing, setIsEditing] = useState(!section);

  if (!section || isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
            {title}
          </h1>
          {section ? (
            <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>
              Close
            </button>
          ) : null}
        </div>
        {section ? (
          null
        ) : null}
        <SectionBuilderForm
          action={saveSectionBuilderAction}
          bookId={bookId}
          mode={section ? "edit" : "create"}
          section={section}
        />
        {section ? (
          <form action={deleteSectionAction}>
            <input type="hidden" name="bookId" value={bookId} />
            <input type="hidden" name="sectionId" value={section.id} />
            <ConfirmSubmitButton
              className="btn btn-outline btn-sm"
              confirmMessage={`Delete "${section.title}" and all of its exercises? This cannot be undone.`}
              label="Delete section"
            />
          </form>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
        {title}
      </h1>
      <button type="button" className="btn btn-outline" onClick={() => setIsEditing(true)}>
        Edit
      </button>
    </div>
  );
}
