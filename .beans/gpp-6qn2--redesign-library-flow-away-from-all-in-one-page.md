---
# gpp-6qn2
title: Redesign library flow away from all-in-one page
status: completed
type: task
priority: normal
created_at: 2026-04-12T07:59:33Z
updated_at: 2026-04-12T18:18:57Z
parent: get-practice-pal-dftm
---

The current Library screen is too dense because it exposes every hierarchy and edit form on one page. Redesign it into clearer web-native flows with lighter summaries and focused edit/create surfaces.

## Todo
- [x] Define a clearer library information architecture for web
- [x] Implement a lighter Library overview instead of all edit forms inline
- [x] Move create and edit actions into focused flows or panels
- [x] Verify lint, typecheck, and build
- [x] Summarize the redesign pass and close the task

## Summary of Changes

Redesigned the library flow away from the all-in-one editor. Library is now a lighter overview with modal top-level creation, focused book and artist detail pages, and dedicated section builder routes.
