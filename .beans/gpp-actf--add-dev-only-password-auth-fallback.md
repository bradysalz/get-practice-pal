---
# gpp-actf
title: Add dev-only password auth fallback
status: completed
type: task
priority: normal
created_at: 2026-04-12T01:49:00Z
updated_at: 2026-04-12T01:53:44Z
---

Add a temporary dev-only password auth fallback behind an environment flag so frontend testing can continue when Supabase magic-link email limits are hit.

## Todo
- [x] Add password sign-in server action
- [x] Gate the fallback UI behind a dev-only env flag
- [x] Update docs and env examples
- [x] Verify lint, typecheck, and build

## Summary of Changes

Added password sign-in and sign-up server actions behind ENABLE_DEV_PASSWORD_LOGIN=true, exposed the fallback UI on /login only when that flag is enabled, updated .env.example and README.md, and verified npm run lint, npm run typecheck, and npm run build.

## Summary of Changes

Added password sign-in and sign-up server actions behind , exposed the fallback UI on  only when that flag is enabled, updated  and , and verified 
> get-practice-pal@0.1.0 lint
> eslint ., 
> get-practice-pal@0.1.0 typecheck
> tsc --noEmit, and 
> get-practice-pal@0.1.0 build
> next build --webpack

▲ Next.js 16.2.3 (webpack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 4.2s
  Running TypeScript ...
  Finished TypeScript in 6.3s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/10) ...
  Generating static pages using 11 workers (2/10) 
  Generating static pages using 11 workers (4/10) 
  Generating static pages using 11 workers (7/10) 
✓ Generating static pages using 11 workers (10/10) in 915ms
  Finalizing page optimization ...
  Collecting build traces ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /auth/confirm
├ ƒ /auth/signout
├ ƒ /library
├ ƒ /login
├ ƒ /sessions
├ ƒ /setlists
└ ƒ /stats


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand.
