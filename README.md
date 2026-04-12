# PracticePal

PracticePal is a mobile-first Next.js application for musicians who want quick practice session logging, library tracking, setlists, and tempo progress over time.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS v4 with DaisyUI
- Supabase client plumbing for future auth and data milestones
- GitHub Actions CI for pull requests and merges

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` when a Supabase project exists.
4. Start the app with `npm run dev`.

## Available scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run check`

## Initial structure scope

This repository currently includes:

- A deployable app shell with Sessions, Library, Setlists, and Stats routes
- A responsive host layout with desktop navigation and mobile bottom tabs
- Supabase-ready browser and server helpers
- CI checks for pull requests and `main`

## Vercel setup

1. Import the GitHub repository into Vercel.
2. Set the framework preset to Next.js if Vercel does not detect it automatically.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Preview and Production environments.
4. Enable automatic deployments for pull requests and for merges to `main`.

Once the repo is connected, Vercel will create preview deployments for pull requests and a production deployment for `main` by default.
