import { HostPage } from "@/components/host-page";

export default function SessionsPage() {
  return (
    <HostPage
      eyebrow="Sessions"
      title="Practice sessions should start fast."
      description="This host page is ready for the timer, resume flow, and post-session editing work that lands in the next milestone."
      primaryCta="Start session"
      secondaryCta="Resume active session"
      highlights={[
        "Quick entry point for a new session",
        "Reserved slot for active-session recovery",
        "Recent sessions list and edit surface",
      ]}
    />
  );
}
