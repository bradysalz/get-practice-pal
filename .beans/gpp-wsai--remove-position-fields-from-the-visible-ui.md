---
# gpp-wsai
title: Remove position fields from the visible UI
status: completed
type: task
priority: normal
created_at: 2026-04-12T18:18:37Z
updated_at: 2026-04-12T21:09:12Z
parent: get-practice-pal-dftm
---

Position is currently exposed as a raw field in many flows. Remove those visible position controls from the UI so ordering does not leak implementation details into normal workflows.

## Todo
- [x] Audit visible position inputs and labels across sessions, library, setlists, and related forms
- [x] Remove or hide position from the default UI flow
- [x] Verify ordering still feels understandable without explicit position controls

## Summary of Changes

Removed visible position and display-order controls from the default UI across sessions, setlists, and library flows while preserving backend ordering through hidden fields. Session item editing now focuses on tempo, setlist items no longer show or request positions, and library section/exercise screens no longer expose raw ordering values. Browser verification confirmed the flows felt cleaner.
