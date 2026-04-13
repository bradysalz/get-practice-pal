"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { PagePanel } from "@/components/ui/primitives";

type ActionModalProps = {
  title?: string;
  description?: string;
  submitFormId?: string;
  submitLabel?: string;
  submitClassName?: string;
  triggerLabel: string;
  triggerClassName?: string;
  children: ReactNode;
};

export function ActionModal({
  title,
  description,
  submitFormId,
  submitLabel,
  submitClassName = "btn btn-primary",
  triggerLabel,
  triggerClassName = "btn btn-primary",
  children,
}: ActionModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setIsOpen(true)}>
        {triggerLabel}
      </button>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <PagePanel className="w-full max-w-xl">
            {(title || description) ? (
              <div className="flex items-start justify-between gap-4">
                <div>
                  {title ? <h2 className="font-display text-xl font-semibold text-base-content">{title}</h2> : null}
                  {description ? (
                    <p className={title ? "mt-2 text-sm leading-6 text-base-content/70" : "text-sm leading-6 text-base-content/70"}>
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div className={title || description ? "mt-5" : ""}>{children}</div>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button type="button" className="btn btn-outline" onClick={() => setIsOpen(false)}>
                Close
              </button>
              {submitFormId && submitLabel ? (
                <button form={submitFormId} type="submit" className={submitClassName}>
                  {submitLabel}
                </button>
              ) : null}
            </div>
          </PagePanel>
        </div>
      ) : null}
    </>
  );
}
