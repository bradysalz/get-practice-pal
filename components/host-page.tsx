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
      <section className="overflow-hidden border-2 border-neutral bg-base-100 p-6 shadow-[4px_4px_0_#0a0a0a] md:p-8">
        <div className="max-w-3xl space-y-5">
          <p className="eyebrow">
            {eyebrow}
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-balance text-base-content md:text-5xl">
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
        <div className="border-2 border-neutral bg-base-100 p-6 shadow-[3px_3px_0_#0a0a0a]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-base-content">Defined for MVP</h2>
            <span className="chip chip-neutral">Host ready</span>
          </div>
          <div className="space-y-3">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="border-2 border-base-300 bg-base-200 px-4 py-3 text-sm font-medium text-base-content/80"
              >
                {highlight}
              </div>
            ))}
          </div>
        </div>
        <div className="border-2 border-dashed border-neutral bg-base-200 p-6">
          <h2 className="text-lg font-bold text-base-content">What lands next</h2>
          <p className="mt-3 text-sm leading-6 text-base-content/75">
            This initial structure only defines the shell. Real forms, timers, search flows, and charts
            will layer onto these routes in the next milestones.
          </p>
        </div>
      </section>
    </div>
  );
}
