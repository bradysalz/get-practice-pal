"use client";

import { useState } from "react";
import { deleteBookAction, updateBookAction } from "@/app/(app)/library/actions";
import { BookMetadataSearch, type LinkedExternalBook } from "@/components/book-metadata-search";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { FormSubmitButton } from "@/components/form-submit-button";
import {
  linkedBookAuthors,
  linkedBookCoverUrl,
  linkedBookPublishedYear,
  resolveLinkedBook,
} from "@/components/linked-book-metadata";
import { TextInput } from "@/components/ui/primitives";

type BookHeroEditorProps = {
  bookId: string;
  composer: string | null;
  externalBook: LinkedExternalBook | LinkedExternalBook[] | null;
  externalBookId: string | null;
  title: string;
};

export function BookHeroEditor({
  bookId,
  composer,
  externalBook,
  externalBookId,
  title,
}: BookHeroEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const resolvedExternalBook = resolveLinkedBook(externalBook);
  const coverUrl = linkedBookCoverUrl(resolvedExternalBook);
  const displayAuthor = composer || linkedBookAuthors(resolvedExternalBook);
  const publishedYear = linkedBookPublishedYear(resolvedExternalBook);

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-5">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="h-36 w-24 shrink-0 rounded object-cover shadow-[3px_3px_0_#0a0a0a]"
                src={coverUrl}
              />
            ) : null}
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
                {title}
              </h1>
              <p className="mt-3 text-lg text-base-content/70">
                {displayAuthor || "No composer set"}
                {publishedYear ? ` · ${publishedYear}` : ""}
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-outline" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        </div>
      </div>
    );
  }

  async function submitBookUpdate(formData: FormData) {
    await updateBookAction(formData);
    setIsEditing(false);
  }

  return (
    <div className="max-w-3xl space-y-4">
      <form action={submitBookUpdate} className="space-y-4">
        <input type="hidden" name="bookId" value={bookId} />
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
            name="composer"
            defaultValue={composer ?? ""}
            placeholder="Composer or author"
          />
          <div className="flex flex-col gap-3 md:flex-row">
            <FormSubmitButton
              label="Save"
              pendingLabel="Saving..."
              className="btn btn-primary w-full md:w-auto"
            />
          </div>
        </div>
        <BookMetadataSearch
          author={composer}
          initialExternalBook={externalBook}
          initialExternalBookId={externalBookId}
          title={title}
        />
      </form>
      <form action={deleteBookAction}>
        <input type="hidden" name="bookId" value={bookId} />
        <ConfirmSubmitButton
          className="btn btn-error btn-sm"
          confirmMessage={`Delete "${title}" and all of its sections and exercises? This cannot be undone.`}
          label="Delete book"
        />
      </form>
    </div>
  );
}
