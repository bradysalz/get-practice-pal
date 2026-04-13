"use client";

import { useState } from "react";
import { updateBookAction } from "@/app/(app)/library/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { TextInput } from "@/components/ui/primitives";

type BookHeroEditorProps = {
  bookId: string;
  composer: string | null;
  title: string;
};

export function BookHeroEditor({ bookId, composer, title }: BookHeroEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-lg text-base-content/70">{composer || "No composer set"}</p>
        </div>
        <button type="button" className="btn btn-outline w-full md:w-auto" onClick={() => setIsEditing(true)}>
          Edit
        </button>
      </div>
    );
  }

  return (
    <form action={updateBookAction} className="max-w-3xl space-y-4">
      <input type="hidden" name="bookId" value={bookId} />
      <TextInput
        className="w-full border-0 bg-transparent p-0 font-display text-3xl font-semibold tracking-tight text-base-content outline-none md:text-5xl"
        name="title"
        defaultValue={title}
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <TextInput
          className="w-full border-0 bg-transparent p-0 text-lg text-base-content/70 outline-none"
          name="composer"
          defaultValue={composer ?? ""}
          placeholder="Composer or author"
        />
        <div className="flex flex-col gap-3 md:flex-row">
          <button type="button" className="btn btn-outline w-full md:w-auto" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
          <FormSubmitButton
            label="Save"
            pendingLabel="Saving..."
            variant="secondary"
            className="btn btn-secondary w-full md:w-auto"
          />
        </div>
      </div>
    </form>
  );
}
