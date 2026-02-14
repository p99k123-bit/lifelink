-- Legacy single-file setup for quick local bootstrapping.
-- Preferred approach: run the ordered files in db/README.md.
-- This file mirrors common migrations + dev environment override.
-- 001_core_schema.sql
-- Shared across dev/staging/prod

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null check (role in ('donor', 'hospital', 'admin')),
  is_suspended boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.app_runtime_config (
  environment text primary key check (environment in ('dev', 'staging', 'prod')),
  allow_investor_seed boolean not null default false,
  seed_label text,
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'donor')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();


-- 002_domain_tables.sql
-- Shared across dev/staging/prod

create table if not exists public.donors (
  id uuid primary key references public.profiles(id) on delete cascade,
  full_name text,
  blood_group text check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  city text,
  phone text,
  last_donated_at date,
  next_eligible_at date,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  id uuid primary key references public.profiles(id) on delete cascade,
  name text,
  city text,
  address text,
  contact_phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.emergency_requests (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  units integer not null check (units > 0),
  city text not null,
  urgency_level text not null check (urgency_level in ('low','medium','critical')),
  status text not null default 'active' check (status in ('active','fulfilled','cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  hospital_id uuid references public.hospitals(id) on delete set null,
  request_id uuid references public.emergency_requests(id) on delete set null,
  donated_on date not null default current_date,
  units integer not null check (units > 0),
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  city text,
  created_at timestamptz not null default now()
);

create table if not exists public.blood_inventory (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  units integer not null default 0 check (units >= 0),
  created_at timestamptz not null default now(),
  unique (hospital_id, blood_group)
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role_created on public.profiles(role, created_at desc);
create index if not exists idx_donors_city_blood on public.donors(city, blood_group);
create index if not exists idx_requests_status_city_created on public.emergency_requests(status, city, created_at desc);
create index if not exists idx_requests_hospital_created on public.emergency_requests(hospital_id, created_at desc);
create index if not exists idx_donations_donor_donated on public.donations(donor_id, donated_on desc);
create index if not exists idx_donations_hospital_donated on public.donations(hospital_id, donated_on desc);
create index if not exists idx_activity_logs_created on public.activity_logs(created_at desc);


-- 003_rls_and_policies.sql
-- Shared across dev/staging/prod

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

alter table public.profiles enable row level security;
alter table public.donors enable row level security;
alter table public.hospitals enable row level security;
alter table public.emergency_requests enable row level security;
alter table public.donations enable row level security;
alter table public.blood_inventory enable row level security;
alter table public.activity_logs enable row level security;
alter table public.app_runtime_config enable row level security;

-- profiles
 drop policy if exists profiles_select_owner_or_admin on public.profiles;
create policy profiles_select_owner_or_admin
  on public.profiles
  for select
  using (auth.uid() = id or public.is_admin());

 drop policy if exists profiles_insert_owner_or_admin on public.profiles;
create policy profiles_insert_owner_or_admin
  on public.profiles
  for insert
  with check (auth.uid() = id or public.is_admin());

 drop policy if exists profiles_update_owner_or_admin on public.profiles;
create policy profiles_update_owner_or_admin
  on public.profiles
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

 drop policy if exists profiles_delete_admin_only on public.profiles;
create policy profiles_delete_admin_only
  on public.profiles
  for delete
  using (public.is_admin());

-- donors
 drop policy if exists donors_select_owner_hospital_admin on public.donors;
create policy donors_select_owner_hospital_admin
  on public.donors
  for select
  using (
    auth.uid() = id
    or public.current_user_role() in ('hospital', 'admin')
  );

 drop policy if exists donors_insert_owner_or_admin on public.donors;
create policy donors_insert_owner_or_admin
  on public.donors
  for insert
  with check (auth.uid() = id or public.is_admin());

 drop policy if exists donors_update_owner_or_admin on public.donors;
create policy donors_update_owner_or_admin
  on public.donors
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- hospitals
 drop policy if exists hospitals_select_authenticated_or_admin on public.hospitals;
create policy hospitals_select_authenticated_or_admin
  on public.hospitals
  for select
  using (
    auth.uid() is not null
    or public.is_admin()
  );

 drop policy if exists hospitals_insert_owner_or_admin on public.hospitals;
create policy hospitals_insert_owner_or_admin
  on public.hospitals
  for insert
  with check (auth.uid() = id or public.is_admin());

 drop policy if exists hospitals_update_owner_or_admin on public.hospitals;
create policy hospitals_update_owner_or_admin
  on public.hospitals
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- emergency_requests
 drop policy if exists requests_select_by_role on public.emergency_requests;
create policy requests_select_by_role
  on public.emergency_requests
  for select
  using (
    public.is_admin()
    or hospital_id = auth.uid()
    or public.current_user_role() = 'donor'
  );

 drop policy if exists requests_insert_hospital_or_admin on public.emergency_requests;
create policy requests_insert_hospital_or_admin
  on public.emergency_requests
  for insert
  with check (
    public.is_admin()
    or (
      hospital_id = auth.uid()
      and public.current_user_role() = 'hospital'
    )
  );

 drop policy if exists requests_update_hospital_or_admin on public.emergency_requests;
create policy requests_update_hospital_or_admin
  on public.emergency_requests
  for update
  using (public.is_admin() or hospital_id = auth.uid())
  with check (public.is_admin() or hospital_id = auth.uid());

 drop policy if exists requests_delete_admin_only on public.emergency_requests;
create policy requests_delete_admin_only
  on public.emergency_requests
  for delete
  using (public.is_admin());

-- donations
 drop policy if exists donations_select_by_owner_or_admin on public.donations;
create policy donations_select_by_owner_or_admin
  on public.donations
  for select
  using (
    public.is_admin()
    or donor_id = auth.uid()
    or hospital_id = auth.uid()
  );

 drop policy if exists donations_insert_hospital_or_admin on public.donations;
create policy donations_insert_hospital_or_admin
  on public.donations
  for insert
  with check (
    public.is_admin()
    or (
      hospital_id = auth.uid()
      and public.current_user_role() = 'hospital'
    )
  );

 drop policy if exists donations_update_admin_only on public.donations;
create policy donations_update_admin_only
  on public.donations
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- blood_inventory
 drop policy if exists inventory_select_hospital_or_admin on public.blood_inventory;
create policy inventory_select_hospital_or_admin
  on public.blood_inventory
  for select
  using (public.is_admin() or hospital_id = auth.uid());

 drop policy if exists inventory_insert_hospital_or_admin on public.blood_inventory;
create policy inventory_insert_hospital_or_admin
  on public.blood_inventory
  for insert
  with check (public.is_admin() or hospital_id = auth.uid());

 drop policy if exists inventory_update_hospital_or_admin on public.blood_inventory;
create policy inventory_update_hospital_or_admin
  on public.blood_inventory
  for update
  using (public.is_admin() or hospital_id = auth.uid())
  with check (public.is_admin() or hospital_id = auth.uid());

 drop policy if exists inventory_delete_hospital_or_admin on public.blood_inventory;
create policy inventory_delete_hospital_or_admin
  on public.blood_inventory
  for delete
  using (public.is_admin() or hospital_id = auth.uid());

-- activity_logs
 drop policy if exists activity_read_admin on public.activity_logs;
create policy activity_read_admin
  on public.activity_logs
  for select
  using (public.is_admin());

 drop policy if exists activity_insert_authenticated on public.activity_logs;
create policy activity_insert_authenticated
  on public.activity_logs
  for insert
  with check (auth.uid() is not null);

-- runtime config
 drop policy if exists runtime_config_read_admin on public.app_runtime_config;
create policy runtime_config_read_admin
  on public.app_runtime_config
  for select
  using (public.is_admin());

 drop policy if exists runtime_config_write_admin on public.app_runtime_config;
create policy runtime_config_write_admin
  on public.app_runtime_config
  for all
  using (public.is_admin())
  with check (public.is_admin());


-- dev environment overrides
insert into public.app_runtime_config (environment, allow_investor_seed, seed_label, updated_at)
values ('dev', true, 'dev-investor-demo', now())
on conflict (environment)
do update set
  allow_investor_seed = excluded.allow_investor_seed,
  seed_label = excluded.seed_label,
  updated_at = now();

