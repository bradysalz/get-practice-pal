---
# gpp-v6f7
title: Enforce minimum form-to-button spacing
status: completed
type: task
priority: normal
created_at: 2026-04-13T07:04:47Z
updated_at: 2026-04-13T08:21:09Z
parent: gpp-1qyh
---

Make sure forms consistently leave enough vertical space between the last field and the primary action button, especially in add/edit modals.

## Todo
- [x] Audit cramped form layouts such as add book and add artist
- [x] Apply a shared minimum spacing rule between fields and action buttons
- [x] Verify the forms feel more breathable without growing unnecessarily

## Summary of Changes\n\nStandardized the minimum spacing between modal form fields and footer actions, removed the extra inner-card layer from create modals, and aligned Close and submit actions into a single footer row.
