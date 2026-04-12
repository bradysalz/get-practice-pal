**IMPORTANT**: before you do anything else, run the `beans prime` command and heed its output.

## Workflow

- Track work in `beans` before changing code.
- Commit and open a PR for all code changes.
- Open normal PRs, not draft PRs.
- It is fine to group several related changes into one PR when they belong to the same milestone or workflow.
- Keep local-only files such as editor swap files and private env files out of commits and PRs.

## Lightweight Tree

```text
.
├── AGENTS.md
├── SPEC.md
├── README.md
├── app/                     # Next.js app routes and pages
│   ├── (app)/               # authenticated app shell routes
│   ├── auth/                # auth callback and sign-out routes
│   └── login/               # magic-link sign-in page
├── components/              # shared UI components
├── lib/
│   ├── auth/                # auth helpers and server actions
│   ├── data/                # backend-facing data services
│   ├── supabase/            # Supabase client/env helpers
│   └── utils/               # smaller shared utilities
├── supabase/
│   └── migrations/          # SQL migrations for the live backend
├── .beans/                  # project work tracking
└── .github/workflows/       # CI automation
```
