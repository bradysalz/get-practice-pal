---
# gpp-o8nv
title: Add magic-link auth flow and protected app shell
status: completed
type: feature
priority: normal
created_at: 2026-04-12T00:59:59Z
updated_at: 2026-04-12T01:07:19Z
parent: get-practice-pal-lrzn
---

Implement the MVP authentication flow with Supabase magic links and protect user-scoped areas.

## Scope
- Login page and magic-link request flow
- Auth confirmation route and session persistence
- Protected app shell and logout support
- Auth-aware session retrieval for server code

## Summary of Changes

Added a Supabase magic-link login page, auth confirmation and sign-out routes, protected the main app shell when Supabase is configured, and added auth-aware session helpers plus proxy-based session refresh.
