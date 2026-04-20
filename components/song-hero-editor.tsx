"use client";

import { useState } from "react";
import { deleteSongAction, updateSongAction } from "@/app/(app)/library/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { FormSubmitButton } from "@/components/form-submit-button";
import { TextInput } from "@/components/ui/primitives";

type SongHeroEditorProps = {
  artistId: string;
  goalTempo: number | null;
  songId: string;
  title: string;
};

export function SongHeroEditor({
  artistId,
  goalTempo,
  songId,
  title,
}: SongHeroEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              {title}
            </h1>
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
      <form action={updateSongAction} className="space-y-4">
        <input type="hidden" name="songId" value={songId} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <TextInput
            className="w-full border-0 bg-transparent p-0 font-display text-3xl font-semibold tracking-tight text-base-content outline-none md:text-5xl md:max-w-[calc(100%-8rem)]"
            name="title"
            defaultValue={title}
          />
          <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TextInput
            className="w-full border-0 bg-transparent p-0 text-lg text-base-content/70 outline-none"
            name="goalTempo"
            defaultValue={goalTempo ?? ""}
            placeholder="Goal tempo"
            type="number"
            min={1}
          />
          <FormSubmitButton
            label="Save"
            pendingLabel="Saving..."
            className="btn btn-primary w-full md:w-auto"
          />
        </div>
      </form>
      <form action={deleteSongAction}>
        <input type="hidden" name="songId" value={songId} />
        <input type="hidden" name="artistId" value={artistId} />
        <ConfirmSubmitButton
          className="btn btn-error btn-sm"
          confirmMessage={`Delete "${title}"? This cannot be undone.`}
          label="Delete song"
        />
      </form>
    </div>
  );
}
