create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text check (role in ('donor','hospital','admin')) not null default 'donor',
  created_at timestamp with time zone default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Enable Row Level Security
alter table if exists public.profiles enable row level security;

-- Allow select only to owner
create policy if not exists "Select own profile" on public.profiles
  for select using ( auth.uid() = id );

-- Allow update only to owner
create policy if not exists "Update own profile" on public.profiles
  for update using ( auth.uid() = id ) with check ( auth.uid() = id );

-- Allow insert when auth.uid() = new.id (covers API inserts). The trigger runs as security definer.
create policy if not exists "Insert own profile" on public.profiles
  for insert with check ( auth.uid() = new.id );
