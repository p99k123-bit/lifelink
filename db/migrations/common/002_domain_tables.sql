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
