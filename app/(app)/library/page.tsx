import { HostPage } from "@/components/host-page";

export default function LibraryPage() {
  return (
    <HostPage
      eyebrow="Library"
      title="Books, sections, exercises, artists, and songs all have a home."
      description="The shell is in place for the nested library structure from the spec, with room for goal tempos and pickers."
      primaryCta="Add library item"
      secondaryCta="Browse hierarchy"
      highlights={[
        "Book -> section -> exercise hierarchy",
        "Artist -> song hierarchy",
        "Goal tempo defaults and future search pickers",
      ]}
    />
  );
}
