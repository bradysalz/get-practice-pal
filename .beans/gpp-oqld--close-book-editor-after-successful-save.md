---
# gpp-oqld
title: Close book editor after successful save
status: completed
type: bug
priority: normal
created_at: 2026-04-24T07:21:22Z
updated_at: 2026-04-24T07:22:44Z
---

- [x] Trace the book editor save flow
- [x] Update the editor to exit edit mode after a successful save
- [x] Verify with repo checks

Saving from the book editor updates the record but leaves the editor open instead of collapsing back to read mode.

## Summary of Changes

- Routed the book editor form through a client-side submit handler that awaits `updateBookAction`.
- Close the editor by setting `isEditing` to false only after the save completes successfully.
- Verified with `npm run lint` and `npm run typecheck`.
