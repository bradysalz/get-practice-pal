---
# gpp-0zrm
title: Fix session item save conflict handling
status: completed
type: bug
priority: normal
created_at: 2026-04-12T02:47:54Z
updated_at: 2026-04-12T02:48:29Z
---

Saving a session item from the frontend fails with PostgreSQL error 42P10 because the app uses ON CONFLICT on nullable columns, while the database uniqueness is enforced with an expression index.

## Todo
- [x] Replace the session item upsert with conflict-safe insert/update logic
- [x] Verify lint, typecheck, and build
- [x] Summarize the fix and close the bug bean

## Summary of Changes

Replaced the practice session item upsert with explicit lookup-and-update or insert logic so session item saves no longer rely on ON CONFLICT against nullable columns. Verified the change with npm run lint and npm run typecheck.
