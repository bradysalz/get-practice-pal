---
# gpp-wsai
title: Remove position fields from the visible UI
status: todo
type: task
created_at: 2026-04-12T18:18:37Z
updated_at: 2026-04-12T18:18:37Z
parent: get-practice-pal-dftm
---

Position is currently exposed as a raw field in many flows. Remove those visible position controls from the UI so ordering does not leak implementation details into normal workflows.

## Todo
- [ ] Audit visible position inputs and labels across sessions, library, setlists, and related forms
- [ ] Remove or hide position from the default UI flow
- [ ] Verify ordering still feels understandable without explicit position controls
