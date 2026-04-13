---
# gpp-53vn
title: Inline book header editing
status: completed
type: task
priority: normal
created_at: 2026-04-12T22:07:42Z
updated_at: 2026-04-13T06:54:33Z
parent: gpp-mmn0
---

Simplify `/library/books/[bookId]` by removing the redundant top edit card. The title and author/composer should be edited directly in the page header area instead of splitting them across separate surfaces.

## Todo
- [x] Move book title editing into the top header area
- [x] Make author/composer editable alongside the title instead of showing it as a badge
- [x] Verify the book detail header feels lighter and clearer

## Summary of Changes

- moved book title and composer editing into the hero area instead of a separate top card
- kept the lighter header layout but restored a read-first default state with an Edit toggle
- simplified the book detail surface without forcing the page to live in edit mode
