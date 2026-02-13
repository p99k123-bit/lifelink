Vercel deployment steps

1. Connect GitHub repo to Vercel (https://vercel.com).
2. In Vercel project settings, set frontend environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` (required)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required)
   - `NEXT_PUBLIC_API_URL` (optional, if your frontend calls backend REST endpoints)
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY` (optional server fallback)
3. If deploying backend separately, set backend environment variables there:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` (service role, keep private)
4. Build & output:
   - Frontend framework: `Next.js` (Next 16)
   - Build command: `npm run build`
   - Output directory: default Next.js output
5. CLI deployment option: run `vercel --prod` and follow prompts.

Notes:
- Do not commit secret keys to the repo.
- If auth env vars are missing, frontend auth pages now redirect to `/auth/setup` with setup instructions.
- `NEXT_PUBLIC_SUPABASE_*` values are mandatory for browser login/signup flows.

Database rollout:
- Apply migration SQL in `db/README.md` (common first, then environment-specific file).
- For demo/staging investor walkthrough data, run:
  - `npm run db:seed:investor`
  - Required env vars: `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) and `SUPABASE_SERVICE_KEY`.
