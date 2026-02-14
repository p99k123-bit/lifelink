# Database Migrations and Seed

## Structure

- `db/migrations/common/`: base schema and RLS policies shared by all environments.
- `db/migrations/dev/`: development-only runtime flags.
- `db/migrations/staging/`: staging runtime flags.
- `db/migrations/prod/`: production runtime flags.
- `scripts/seed-investor-demo.cjs`: idempotent investor demo seeding script.

## Migration Order

Run SQL in this exact order:

1. `db/migrations/common/001_core_schema.sql`
2. `db/migrations/common/002_domain_tables.sql`
3. `db/migrations/common/003_rls_and_policies.sql`
4. For development: `db/migrations/dev/100_environment.sql`
5. For staging: `db/migrations/staging/100_environment.sql`
6. For production: `db/migrations/prod/100_environment.sql`

## Investor Demo Seed

Required environment variables:

- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_KEY`

Optional:

- `DEMO_ENV` (`dev` by default)
- `DEMO_USER_PASSWORD` (default: `BloodLine@2026!`)
- `FORCE_DEMO_SEED=true` (required only when seed is disabled for that env)

Run:

```bash
node scripts/seed-investor-demo.cjs
```

Notes:

- Script is idempotent for demo accounts and demo operational rows.
- It creates/updates auth users through Supabase Admin API, then upserts `profiles`, `donors`, `hospitals`, `blood_inventory`, `emergency_requests`, `donations`, and `activity_logs`.
- In production, default runtime config disables investor seed unless `FORCE_DEMO_SEED=true` is explicitly set.
