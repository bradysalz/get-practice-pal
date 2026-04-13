---
# gpp-r8eb
title: Standardize on DaisyUI components and theme primitives
status: completed
type: task
priority: normal
created_at: 2026-04-12T18:18:37Z
updated_at: 2026-04-12T18:59:37Z
parent: get-practice-pal-dftm
---

The UI still uses too many one-off button, field, and surface treatments instead of leaning on DaisyUI consistently.

## Todo
- [x] Audit custom controls and component variants that duplicate DaisyUI primitives
- [x] Consolidate buttons, fields, cards, and typography onto a smaller shared component/theme set
- [x] Verify the app feels more consistent without losing the accepted visual direction

## Summary of Changes

Standardized the main workflow screens around a smaller DaisyUI-style primitive set by introducing shared outline and field treatments, expanding the shared submit button variants, and replacing most one-off ghost-plus-border and input-bordered combinations across library, setlists, sessions, stats, login, and modal surfaces. Also fixed primary and error button contrast so high-emphasis actions like Add section and End session render with white text.
