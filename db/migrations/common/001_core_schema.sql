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
