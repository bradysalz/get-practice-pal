"use client";

import { useMemo, useRef, useState } from "react";

type FormSelectOption = {
  label: string;
  value: string;
};

type FormSelectProps = {
  defaultValue?: string;
  emptyLabel?: string;
  label: string;
  name: string;
  onChange?: (value: string) => void;
  options: FormSelectOption[];
};

export function FormSelect({
  defaultValue = "",
  emptyLabel = "Select an option",
  label,
  name,
  onChange,
  options,
}: FormSelectProps) {
  const [value, setValue] = useState(defaultValue);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const selectedLabel = useMemo(() => {
    if (!value) {
      return emptyLabel;
    }

    return options.find((option) => option.value === value)?.label ?? emptyLabel;
  }, [emptyLabel, options, value]);

  function closeMenu() {
    detailsRef.current?.removeAttribute("open");
  }

  return (
    <label className="form-control w-full">
      <span className="label-text mb-3 text-[0.95rem] font-medium text-base-content">{label}</span>
      <input type="hidden" name={name} value={value} />
      <details ref={detailsRef} className="dropdown dropdown-bottom w-full">
        <summary className="form-select-trigger">
          <span className={`truncate ${value ? "text-base-content" : "text-base-content/45"}`}>
            {selectedLabel}
          </span>
          <span className="form-select-chevron" aria-hidden="true">
            ▾
          </span>
        </summary>
        <ul className="dropdown-content form-select-menu menu w-full bg-base-100 p-2">
          <li>
            <button
              className={!value ? "form-select-active" : ""}
              type="button"
              onClick={() => {
                setValue("");
                onChange?.("");
                closeMenu();
              }}
            >
              {emptyLabel}
            </button>
          </li>
          {options.map((option) => (
            <li key={option.value}>
              <button
                className={value === option.value ? "form-select-active" : ""}
                type="button"
                onClick={() => {
                  setValue(option.value);
                  onChange?.(option.value);
                  closeMenu();
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </details>
    </label>
  );
}
