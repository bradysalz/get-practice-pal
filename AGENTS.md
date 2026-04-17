
## Workflow

- Open a branch before editing any code. If already on a branch, continue to use that.
- Commit and open a PR for all code changes.
- Open normal PRs, not draft PRs.
- Do not commit directly to `master`; always use a branch and land changes through the PR flow.
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
├── .beads/                  # Beads project work tracking
└── .github/workflows/       # CI automation
```

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
