---
# get-practice-pal-7gzx
title: Add CI checks for pull requests and merge safety
status: completed
type: feature
priority: normal
created_at: 2026-04-12T00:26:21Z
updated_at: 2026-04-12T00:33:29Z
parent: get-practice-pal-yh1f
---

Ensure pull requests and merges exercise the core quality gates.

## Scope
- GitHub Actions or equivalent CI config
- Lint, typecheck, and build verification
- Fast feedback for pull requests
- Main branch protection-ready checks

## Summary of Changes

Added a GitHub Actions workflow that runs npm ci, lint, typecheck, and build on pull requests and on pushes to main.
