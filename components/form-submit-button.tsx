"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export function FormSubmitButton({
  label,
  pendingLabel = "Saving...",
  className = "btn btn-primary btn-sm",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}
