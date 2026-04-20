"use client";

import { useFormStatus } from "react-dom";
import type { ComponentPropsWithoutRef } from "react";

type ConfirmSubmitButtonProps = {
  className?: string;
  confirmMessage: string;
  label: string;
  pendingLabel?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "children" | "className" | "onClick" | "type">;

export function ConfirmSubmitButton({
  className = "btn btn-error btn-sm",
  confirmMessage,
  label,
  pendingLabel = "Deleting...",
  ...props
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      {...props}
      disabled={pending || props.disabled}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
