---
# gpp-hg7x
title: Define Supabase schema and RLS policies for MVP tables
status: completed
type: feature
priority: normal
created_at: 2026-04-12T00:59:59Z
updated_at: 2026-04-12T01:07:19Z
parent: get-practice-pal-qk9s
---

Create the SQL schema for library, setlists, sessions, and practiced items with user ownership and row-level security.

## Scope
- Core tables and foreign keys
- Ownership columns and RLS policies
- Goal tempo and hierarchy support
- Database-side integrity constraints

## Summary of Changes

Added the Backend MVP SQL migration covering profiles, library, setlists, sessions, practiced items, ownership columns, indexes, triggers, and row-level security policies.
