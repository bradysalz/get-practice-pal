---
# gpp-8k5m
title: Simplify login and signup page
status: completed
type: task
priority: normal
created_at: 2026-04-12T22:07:42Z
updated_at: 2026-04-13T06:57:35Z
parent: gpp-mmn0
---

Reduce the auth page density and copy. Keep the needed functionality, but make the screen feel lighter and more direct.

## Todo
- [x] Remove redundant explanatory copy from the login/signup page
- [x] Simplify the auth layout so the primary action is more obvious
- [x] Verify the page feels cleaner without losing necessary guidance

## Summary of Changes

- removed most of the redundant auth-page copy and collapsed the layout into one primary card
- kept magic link as the obvious primary action while retaining the dev password fallback when enabled, with password sign-in using the same red primary treatment
- tightened the page overall, then added a little extra spacing above the auth buttons to keep the form rhythm consistent
