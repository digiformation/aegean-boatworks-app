# Aegean Boatworks — Boatyard Management Demo

Demo app for the [Aegean Boatworks case study](https://digiform.gr/case-studies/aegean-boatworks) at digiform.gr.
**Live:** https://aegean-boatworks.digiform.gr

## What it is
Job management system for a fictional boatyard: track boats, customers, and service jobs
through a status pipeline (intake → in progress → waiting parts → ready → complete → invoiced).

## Stack
Next.js 16 · Supabase · Turborepo · pnpm · TypeScript · Tailwind CSS 4

## Local dev
```sh
cp apps/boatyard/.env.example apps/boatyard/.env.local
# Fill in Supabase keys from the project dashboard
pnpm install
pnpm turbo dev --filter=@digiform/boatyard
```
