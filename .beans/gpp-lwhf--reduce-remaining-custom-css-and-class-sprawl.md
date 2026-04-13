---
# gpp-lwhf
title: Reduce remaining custom CSS and class sprawl
status: completed
type: task
priority: normal
created_at: 2026-04-13T01:05:13Z
updated_at: 2026-04-13T01:30:42Z
---

Keep the accepted punchier visual direction, but continue reducing custom CSS and repeated per-element class stacks by leaning more on shared components and standard theme primitives.

## Todo
- [x] Audit the remaining custom surface and typography classes in globals.css and identify what can collapse into shared component primitives
- [x] Replace repeated class stacks across workflow screens with a smaller shared component/layout base
- [x] Verify the app keeps the accepted visual style while relying less on custom per-element styling

## Summary of Changes

- added a shared UI primitive layer for page heroes, panels, stats, empty states, fields, inputs, textareas, card links, and drag handles
- moved the main library, sessions, setlists, stats, login, modal, select, section builder, and draggable row flows onto the shared base instead of repeated one-off class stacks
- removed dead custom field/surface CSS from globals.css and kept the accepted visual direction with lighter shared markup
- preserved the existing sidebar look while fixing nested route highlighting for library and setlist subpages, and slightly strengthened list-row borders for dense data rows
