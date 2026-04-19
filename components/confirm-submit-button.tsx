"use client";

import { useFormStatus } from "react-dom";

type ConfirmSubmitButtonProps = {
  className?: string;
  confirmMessage: string;
  label: string;
  pendingLabel?: string;
};

export function ConfirmSubmitButton({
  className = "btn btn-error btn-sm",
  confirmMessage,
  label,
  pendingLabel = "Deleting...",
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
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
