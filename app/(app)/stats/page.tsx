import { HostPage } from "@/components/host-page";

export default function StatsPage() {
  return (
    <HostPage
      eyebrow="Stats"
      title="Tempo progress and completion views have a defined landing zone."
      description="The frontend shell now has a home for progress charts, time-window controls, and book completion summaries."
      primaryCta="View tempo trends"
      secondaryCta="View book progress"
      highlights={[
        "Single-item tempo trend view",
        "Book or section completion summary",
        "Time-window controls for week to all time",
      ]}
    />
  );
}
