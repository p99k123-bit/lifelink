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
