---
# gpp-1yjv
title: Stop tracking excluded repo-housekeeping bean file
status: completed
type: task
priority: normal
created_at: 2026-04-24T07:13:39Z
updated_at: 2026-04-24T07:13:47Z
---

- [ ] Confirm the bean file is removed from the Git index
- [x] Commit the untracking change

User moved `.beans/gpp-n1uq--publish-remaining-local-repo-housekeeping-changes.md` into local exclude rules and wants the tracked file removed from Git.

## Summary of Changes

- Confirmed `.beans/gpp-n1uq--publish-remaining-local-repo-housekeeping-changes.md` is staged as a Git deletion while the local file remains present.
- Committed the untracking change so the repo stops tracking that locally excluded bean file.
