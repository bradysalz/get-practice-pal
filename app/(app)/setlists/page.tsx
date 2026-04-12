import { HostPage } from "@/components/host-page";

export default function SetlistsPage() {
  return (
    <HostPage
      eyebrow="Setlists"
      title="Plan a session before you sit down to practice."
      description="This page gives the product a dedicated setlist area from day one instead of burying it inside the library."
      primaryCta="Create setlist"
      secondaryCta="Start from setlist"
      highlights={[
        "Dedicated setlist management route",
        "Mixed library item support planned",
        "Session launch path reserved in the shell",
      ]}
    />
  );
}
