# BloodLine Frontend

Next.js 16 frontend for BloodLine.

## Quick start

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`: your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: your Supabase anon key

Without these two variables, auth pages redirect to `/auth/setup` and protected routes remain unavailable.

## Optional environment variables

- `SUPABASE_URL`: server-only fallback URL for auth helpers
- `SUPABASE_ANON_KEY`: server-only fallback anon key for auth helpers
- `NEXT_PUBLIC_API_URL`: backend API base URL for non-Supabase endpoints
