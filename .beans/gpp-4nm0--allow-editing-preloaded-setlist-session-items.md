---
# gpp-4nm0
title: Allow editing preloaded setlist session items
status: completed
type: bug
priority: normal
created_at: 2026-04-12T18:08:32Z
updated_at: 2026-04-12T18:19:24Z
parent: get-practice-pal-dftm
---

Sessions started from a setlist currently preload items but treat them like static rows. They should be editable like manually logged items.

## Todo
- [x] Add an explicit update path for existing session items
- [x] Expose inline editing for tempo and order on preloaded session rows
- [x] Verify editing works for setlist-started sessions in the browser

## Summary of Changes

Added inline editing for preloaded session rows so tempo and slot can be adjusted after starting from a setlist, matching normal logged-item behavior.
