"use client";

import { useState } from "react";
import { updateSetlistAction } from "@/app/(app)/setlists/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { TextInput, Textarea } from "@/components/ui/primitives";
import type { LibrarySnapshot } from "@/lib/data/library";

type SetlistHeroEditorProps = {
  setlist: NonNullable<LibrarySnapshot["setlists"]>[number];
};

export function SetlistHeroEditor({ setlist }: SetlistHeroEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              {setlist.name}
            </h1>
            {setlist.description ? (
              <p className="mt-3 text-base-content/70">{setlist.description}</p>
            ) : null}
          </div>
          <button type="button" className="btn btn-outline" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={updateSetlistAction} className="max-w-3xl space-y-4">
      <input type="hidden" name="setlistId" value={setlist.id} />
      <input type="hidden" name="returnPath" value={`/setlists/${setlist.id}`} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <TextInput
          className="w-full border-0 bg-transparent p-0 font-display text-3xl font-semibold tracking-tight text-base-content outline-none md:text-5xl md:max-w-[calc(100%-8rem)]"
          name="name"
          defaultValue={setlist.name}
        />
        <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
      </div>
      <Textarea
        name="description"
        defaultValue={setlist.description ?? ""}
        placeholder="Description"
      />
      <FormSubmitButton
        label="Save"
        pendingLabel="Saving..."
        className="btn btn-primary w-full md:w-auto"
      />
    </form>
  );
}
