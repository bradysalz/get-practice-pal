"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type ActionModalProps = {
  title: string;
  description?: string;
  triggerLabel: string;
  triggerClassName?: string;
  children: ReactNode;
};

export function ActionModal({
  title,
  description,
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
          <div className="page-panel w-full max-w-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-base-content">{title}</h2>
                {description ? (
                  <p className="mt-2 text-sm leading-6 text-base-content/70">{description}</p>
                ) : null}
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
