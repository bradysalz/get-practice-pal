import Link from "next/link";

const heroStats = [
  { label: "Books", value: "8" },
  { label: "Songs", value: "42" },
  { label: "Today", value: "38m" },
];

const libraryRows = [
  { title: "Daily Technique", meta: "Book - 12 sections", progress: "78%" },
  { title: "Left Hand Studies", meta: "Section - 9 exercises", progress: "64%" },
  { title: "Blue Bossa", meta: "Song - 156 BPM goal", progress: "91%" },
];

const setlistRows = ["Warmup", "Bach A minor", "Autumn Leaves", "Sight reading"];

const sections = [
  {
    title: "Build a practice library",
    body: "Organize books, sections, exercises, artists, and songs so every practice item has one reliable home.",
  },
  {
    title: "Practice from setlists",
    body: "Group work into focused sessions without losing the link back to the source material and tempo goals.",
  },
  {
    title: "Track useful progress",
    body: "See completion and max-tempo progress where you already manage the material instead of in a separate stats silo.",
  },
];

export default function HomePage() {
  return (
    <main className="public-home min-h-screen bg-base-100 text-base-content">
      <section className="public-hero">
        <div className="public-hero-content">
          <p className="eyebrow">PracticePal</p>
          <h1>PracticePal</h1>
          <p className="public-hero-copy">
            A focused workspace for musicians who want their books, songs, setlists, sessions, and progress in one place.
          </p>
          <div className="public-actions">
            <Link className="btn btn-primary" href="/login">
              Sign in
            </Link>
            <Link className="btn btn-outline" href="/sessions">
              Open app
            </Link>
          </div>
          <div className="public-stat-strip" aria-label="Example practice library totals">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="public-hero-visual" aria-label="PracticePal product screenshots">
          <div className="hero-shot hero-shot-library">
            <div className="shot-bar">
              <span />
              <span />
              <span />
            </div>
            <div className="shot-header">
              <p>Library</p>
              <strong>Current work</strong>
            </div>
            <div className="shot-grid">
              {libraryRows.map((row) => (
                <div key={row.title} className="shot-card">
                  <div>
                    <strong>{row.title}</strong>
                    <span>{row.meta}</span>
                  </div>
                  <em>{row.progress}</em>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-shot hero-shot-session">
            <div className="shot-header">
              <p>Active session</p>
              <strong>38:14</strong>
            </div>
            <div className="session-meter">
              <span />
            </div>
            <div className="session-list">
              {setlistRows.map((row, index) => (
                <div key={row}>
                  <span>{index + 1}</span>
                  <strong>{row}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="public-section public-section-intro">
        <div className="public-section-inner">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>Turn scattered practice notes into a working system.</h2>
          </div>
          <div className="public-feature-grid">
            {sections.map((section) => (
              <article key={section.title} className="public-feature-card">
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-section-inner public-screenshot-layout">
          <div className="public-copy-block">
            <p className="eyebrow">Screenshots</p>
            <h2>Library-first progress, not a separate dashboard habit.</h2>
            <p>
              Book, section, exercise, artist, and song pages keep goals and progress near the material. Setlists and
              sessions reuse those same library items so practice stays connected.
            </p>
          </div>
          <div className="screenshot-stack" aria-label="PracticePal interface screenshots">
            <div className="screenshot-panel screenshot-panel-main">
              <div className="screenshot-topline">
                <strong>Section: Arpeggio Forms</strong>
                <span>6/8 complete</span>
              </div>
              <div className="screenshot-progress">
                <span style={{ width: "72%" }} />
              </div>
              <div className="screenshot-list">
                <span>Root position triads</span>
                <span>First inversion triads</span>
                <span>Seventh chord cycle</span>
              </div>
            </div>
            <div className="screenshot-panel screenshot-panel-side">
              <div className="screenshot-topline">
                <strong>Setlist</strong>
                <span>24m</span>
              </div>
              <div className="screenshot-list compact">
                <span>Warmup grid</span>
                <span>Etude No. 3</span>
                <span>Blue Bossa</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
