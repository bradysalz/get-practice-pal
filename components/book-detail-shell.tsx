"use client";

import Link from "next/link";
import { useState } from "react";
import { reorderBookSectionsAction } from "@/app/(app)/library/actions";
import { BookHeroEditor } from "@/components/book-hero-editor";
import { DraggableBookSections } from "@/components/draggable-book-sections";
import { EmptyState, PageHero, PagePanel, StatCard } from "@/components/ui/primitives";
import type { LinkedExternalBook } from "@/components/book-metadata-search";

type BookSectionItem = {
  completionLabel: string;
  exerciseCount: number;
  id: string;
  title: string;
};

export function BookDetailShell({
  bookId,
  composer,
  externalBook,
  externalBookId,
  sectionCount,
  sectionItems,
  title,
  totalCompletionPercent,
  totalExerciseCount,
}: {
  bookId: string;
  composer: string | null;
  externalBook: LinkedExternalBook | LinkedExternalBook[] | null;
  externalBookId: string | null;
  sectionCount: number;
  sectionItems: BookSectionItem[];
  title: string;
  totalCompletionPercent: number;
  totalExerciseCount: number;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <PageHero
        backHref="/library"
        backLabel="Back to library"
        eyebrow="Book"
        title=""
        stats={
          <div className="grid grid-cols-3 gap-2 md:min-w-[26rem] md:gap-3">
            <StatCard compact label="Sections" value={String(sectionCount)} />
            <StatCard compact label="Exercises" value={String(totalExerciseCount)} />
            <StatCard compact label="Completion" value={`${totalCompletionPercent}%`} />
          </div>
        }
      >
        <BookHeroEditor
          bookId={bookId}
          composer={composer}
          externalBook={externalBook}
          externalBookId={externalBookId}
          onEditingChange={setIsEditing}
          title={title}
        />
      </PageHero>

      <section className="space-y-6">
        <PagePanel>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary">Sections</h2>
            </div>
            <Link href={`/library/books/${bookId}/sections/new`} className="btn btn-primary">
              Add section
            </Link>
          </div>

          <div className="mt-5">
            {sectionItems.length ? (
              isEditing ? (
                <div className="space-y-3">
                  <p className="text-sm text-base-content/70">Drag sections by the handle while book editing is open.</p>
                  <DraggableBookSections
                    bookId={bookId}
                    onReorder={reorderBookSectionsAction}
                    sections={sectionItems}
                  />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {sectionItems.map((section) => (
                    <Link
                      key={section.id}
                      href={`/library/books/${bookId}/sections/${section.id}`}
                      className="list-row min-h-32 p-4 transition-all hover:shadow-[3px_3px_0_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    >
                      <p className="font-semibold leading-tight text-base-content">{section.title}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="chip chip-neutral">
                          {section.exerciseCount} exercise{section.exerciseCount === 1 ? "" : "s"}
                        </span>
                        {section.completionLabel ? <span className="chip">{section.completionLabel}</span> : null}
                      </div>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              <EmptyState label="No sections yet. Add your first section." />
            )}
          </div>
        </PagePanel>
      </section>
    </div>
  );
}
