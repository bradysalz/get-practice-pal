type HostPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  highlights: string[];
};

export function HostPage({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  highlights,
}: HostPageProps) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-base-300/70 bg-base-100/85 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="max-w-3xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">
            {eyebrow}
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance text-base-content md:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-base-content/75 md:text-base">
              {description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary">{primaryCta}</button>
            <button className="btn btn-outline">{secondaryCta}</button>
          </div>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/80 p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-base-content">Defined for MVP</h2>
            <span className="badge badge-outline">Host ready</span>
          </div>
          <div className="space-y-3">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-[1.25rem] bg-base-200/80 px-4 py-3 text-sm text-base-content/80"
              >
                {highlight}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-dashed border-secondary/40 bg-secondary/8 p-6">
          <h2 className="text-lg font-semibold text-base-content">What lands next</h2>
          <p className="mt-3 text-sm leading-6 text-base-content/75">
            This initial structure only defines the shell. Real forms, timers, search flows, and charts
            will layer onto these routes in the next milestones.
          </p>
        </div>
      </section>
    </div>
  );
}
