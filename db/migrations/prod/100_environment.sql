-- production environment overrides
insert into public.app_runtime_config (environment, allow_investor_seed, seed_label, updated_at)
values ('prod', false, 'disabled', now())
on conflict (environment)
do update set
  allow_investor_seed = excluded.allow_investor_seed,
  seed_label = excluded.seed_label,
  updated_at = now();
