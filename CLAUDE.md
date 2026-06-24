# Aegean Boatworks — Boatyard Job Management Demo

**Live:** https://aegean-boatworks.digiform.gr
**Repo:** digiformation/aegean-boatworks-app → Vercel project: `aegean-boatworks`
**Case study:** https://digiform.gr/case-studies/aegean-boatworks

## Stack
Next.js 16 (Turbopack) · React 19 · Tailwind CSS 4 · Supabase · TypeScript
Monorepo: Turborepo + pnpm workspaces
Package manager: pnpm

## Local dev
```sh
# First time setup:
cp apps/boatyard/.env.example apps/boatyard/.env.local
# Edit .env.local — fill in Supabase keys (see Environment variables below)

pnpm install
pnpm turbo dev --filter=@digiform/boatyard    # http://localhost:3000

# Build check:
pnpm turbo run build --filter=@digiform/boatyard
```

## Environment variables
Add to `apps/boatyard/.env.local` (never commit this file):

```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase dashboard → project → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase dashboard → project → Settings → API → anon key
SUPABASE_SERVICE_ROLE_KEY=      # Supabase dashboard → project → Settings → API → service_role key
```

Supabase project ID: `modjhzgjpqfygqipretd`

## Key paths
```
apps/boatyard/app/(app)/            pages behind the main app layout
apps/boatyard/app/(app)/jobs/       jobs list page + server actions
apps/boatyard/app/(app)/jobs/actions.ts  status advance server action
apps/boatyard/lib/supabase.ts       DB clients: createAdminClient() + createAnonClient()
apps/boatyard/lib/types.ts          JobWithBoat and other shared types
apps/boatyard/lib/database.types.ts auto-generated Supabase TypeScript types
packages/auth/                      auth helpers (shared across apps)
packages/db/                        DB schema types (shared across apps)
```

## Common tasks

**Update demo data:**
Use Supabase dashboard → Table Editor → `jobs`, `boats`, or `customers` tables.
Demo tenant ID: `00000000-0000-0000-0000-000000000001`

**Add a new page:**
Create `apps/boatyard/app/(app)/[page-name]/page.tsx`

**Add or modify a job status:**
Edit `STATUS_FLOW` in `apps/boatyard/app/(app)/jobs/actions.ts`
Also update the `status` column check constraint in Supabase if adding new values.

**Regenerate TypeScript types after schema change:**
```sh
npx supabase gen types typescript \
  --project-id modjhzgjpqfygqipretd \
  > apps/boatyard/lib/database.types.ts
```
Then fix any type errors that surface.

## Deploy process
Push to a feature branch → open PR on GitHub → review diff → merge → Vercel auto-deploys.
Never push directly to `main`.

## IMPORTANT — Windows deployment note
Never run `vercel build` locally on Windows and push the `.vercel/output` directory.
The local build embeds Windows absolute paths (`C:\Users\...`) into build artifacts,
which fail on Vercel's Linux servers. Always push code and let Vercel build it.
