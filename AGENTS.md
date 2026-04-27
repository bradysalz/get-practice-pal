**IMPORTANT**: before you do anything else, run the `beans prime` command and heed its output.

## Workflow

- Open a branch before editing any code. If already on a branch, continue to use that.
- Commit all code changes.
- Do not open a PR until a feature is approved and complete.
- Open normal PRs, not draft PRs.
- Do not commit directly to `master`; always use a branch and land changes through the PR flow.
- Never merge UI changes unless the user explicitly approves the merge after reviewing them.
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
├── .beans/                  # Beans local work tracking files
└── .github/workflows/       # CI automation
```
