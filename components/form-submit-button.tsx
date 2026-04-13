"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
  size?: "xs" | "sm" | "md";
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "error";
};

export function FormSubmitButton({
  label,
  pendingLabel = "Saving...",
  className,
  size = "sm",
  variant = "primary",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const resolvedClassName = className ?? `btn btn-${variant} btn-${size}`;

  return (
    <button type="submit" className={resolvedClassName} disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}
