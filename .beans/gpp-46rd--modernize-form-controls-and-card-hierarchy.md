---
# gpp-46rd
title: Modernize form controls and card hierarchy
status: completed
type: task
priority: normal
created_at: 2026-04-12T08:48:55Z
updated_at: 2026-04-13T01:02:12Z
parent: gpp-mmn0
---

Refresh the shared form system so controls feel more current and readable.

## Todo
- [x] Replace the stale native select treatment with a more modern down-opening control
- [x] Increase the default type scale for form labels, inputs, and supporting UI text
- [x] Simplify card and section titles so hierarchy is clearer and accents are less noisy
- [x] Unify inconsistent button treatments and streamline session start controls
- [x] Verify the refreshed forms in the browser, then run lint/build and final typecheck

## Summary of Changes

Completed the current UI punch-up and shared-component-base pass. The app now leans more heavily on a unified theme and shared component primitives, the form system is more cohesive, titles and card hierarchy are cleaner, and the branch builds cleanly after removing the dev-only route-type import and remote font dependency. More focused follow-on polish remains in Beautification V2.
