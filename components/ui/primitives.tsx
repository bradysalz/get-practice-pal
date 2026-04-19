import Link from "next/link";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PageHero({
  actions,
  backHref,
  backLabel,
  children,
  eyebrow,
  stats,
  title,
}: {
  actions?: ReactNode;
  backHref?: string;
  backLabel?: ReactNode;
  children?: ReactNode;
  eyebrow: string;
  stats?: ReactNode;
  title: string;
}) {
  return (
    <section className="page-hero p-6 md:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          {backHref && backLabel ? (
            <Link href={backHref} className="text-sm font-bold uppercase tracking-wide text-primary">
              {backLabel}
            </Link>
          ) : null}
          <p className={joinClasses("eyebrow", backHref ? "mt-4" : undefined)}>{eyebrow}</p>
          {title ? (
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
              {title}
            </h1>
          ) : null}
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
        {stats ? <div>{stats}</div> : null}
        {actions ? <div>{actions}</div> : null}
      </div>
    </section>
  );
}

export function PagePanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={joinClasses("page-panel p-6", className)}>{children}</section>;
}

export function SectionTitle({
  actions,
  children,
  title,
}: {
  actions?: ReactNode;
  children?: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-bold text-primary">{title}</h2>
        {children ? <div className="mt-2">{children}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="soft-stat px-4 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-current opacity-70">
        {label}
      </p>
      <p className="mt-2 text-[2rem] font-bold text-base-content">{value}</p>
    </div>
  );
}

export function EmptyState({ label, className }: { label: string; className?: string }) {
  return <div className={joinClasses("empty-box px-4 py-4 text-sm", className)}>{label}</div>;
}

export function CardLink({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "accent-card block p-5 transition-all hover:shadow-[4px_4px_0_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="form-control w-full">
      <span className="label-text mb-2 text-sm font-medium text-base-content">{label}</span>
      {children}
    </label>
  );
}

export function FormActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={joinClasses("pt-2", className)}>{children}</div>;
}

export const TextInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  function TextInput(props, ref) {
    return <input ref={ref} {...props} className={joinClasses("input w-full", props.className)} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<"textarea">>(
  function Textarea(props, ref) {
    return <textarea ref={ref} {...props} className={joinClasses("textarea w-full", props.className)} />;
  },
);

export const DragHandle = forwardRef<HTMLButtonElement, { label: string } & ComponentPropsWithoutRef<"button">>(
  function DragHandle({ label, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        {...props}
        className={joinClasses("btn btn-ghost btn-sm cursor-grab active:cursor-grabbing", props.className)}
        aria-label={label}
      >
        ⋮⋮
      </button>
    );
  },
);
