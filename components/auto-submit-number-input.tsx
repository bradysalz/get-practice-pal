"use client";

import type { ComponentPropsWithoutRef } from "react";

type AutoSubmitNumberInputProps = Omit<ComponentPropsWithoutRef<"input">, "defaultValue" | "onBlur" | "type"> & {
  defaultValue: number | string;
  ignoreBlurSubmitSelector?: string;
  initialValue: number | string | null;
};

export function AutoSubmitNumberInput({
  defaultValue,
  ignoreBlurSubmitSelector,
  initialValue,
  ...props
}: AutoSubmitNumberInputProps) {
  return (
    <input
      {...props}
      type="number"
      defaultValue={defaultValue}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        const isMovingToIgnoredTarget = nextFocus instanceof HTMLElement && ignoreBlurSubmitSelector
          ? Boolean(nextFocus.closest(ignoreBlurSubmitSelector))
          : false;

        if (!isMovingToIgnoredTarget && event.currentTarget.value !== String(initialValue ?? "")) {
          event.currentTarget.form?.requestSubmit();
        }
      }}
    />
  );
}
