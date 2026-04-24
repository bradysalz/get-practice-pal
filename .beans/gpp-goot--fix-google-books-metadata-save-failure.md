---
# gpp-goot
title: Fix Google Books metadata save failure
status: completed
type: bug
priority: normal
created_at: 2026-04-24T06:45:39Z
updated_at: 2026-04-24T06:53:21Z
---

- [x] Reproduce the failing save path in the Google Books metadata flow
- [x] Identify the invalid payload or persistence mismatch
- [x] Implement and verify the fix

User reports a 500 from `saveBookMetadataSelectionAction` when saving a Google Book into the library.

## Summary of Changes

- Reduced `saveBookMetadataSelectionAction` to return only the external-book fields the client uses.
- Sanitized Google Books raw metadata through JSON serialization before persisting it.
- Verified the change with `npm run lint`, `npm run typecheck`, and a rollback insert against `external_books` for the failing Google volume.
