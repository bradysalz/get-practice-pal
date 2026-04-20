"use client";

import { useState } from "react";
import { deleteArtistAction, updateArtistAction } from "@/app/(app)/library/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { FormSubmitButton } from "@/components/form-submit-button";
import { TextInput } from "@/components/ui/primitives";

type ArtistHeroEditorProps = {
  artistId: string;
  name: string;
};

export function ArtistHeroEditor({ artistId, name }: ArtistHeroEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              {name}
            </h1>
            <p className="mt-3 text-lg text-base-content/70">Artist</p>
          </div>
          <button type="button" className="btn btn-outline" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <form action={updateArtistAction} className="space-y-4">
        <input type="hidden" name="artistId" value={artistId} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <TextInput
            className="w-full border-0 bg-transparent p-0 font-display text-3xl font-semibold tracking-tight text-base-content outline-none md:text-5xl md:max-w-[calc(100%-8rem)]"
            name="name"
            defaultValue={name}
          />
          <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
        <FormSubmitButton
          label="Save"
          pendingLabel="Saving..."
          className="btn btn-primary w-full md:w-auto"
        />
      </form>
      <form action={deleteArtistAction}>
        <input type="hidden" name="artistId" value={artistId} />
        <ConfirmSubmitButton
          className="btn btn-error btn-sm"
          confirmMessage={`Delete "${name}" and all of their songs? This cannot be undone.`}
          label="Delete artist"
        />
      </form>
    </div>
  );
}
