-- Run once in the Supabase SQL editor. Keep the service role key server-side.
create table if not exists public.site_content (
  id text primary key check (id = 'main'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
-- No client policies: only the server-side service role can read/write this table.
create table if not exists public.admin_login_attempts (
  ip_address text primary key,
  failures integer not null default 0,
  window_started_at timestamptz not null default now()
);
alter table public.admin_login_attempts enable row level security;
create or replace function public.allow_admin_login(ip_address text)
returns boolean language plpgsql security definer set search_path = public as $$
declare attempts admin_login_attempts%rowtype;
begin
 insert into admin_login_attempts(ip_address,failures,window_started_at) values(allow_admin_login.ip_address,0,now())
 on conflict(ip_address) do nothing;
 select * into attempts from admin_login_attempts where admin_login_attempts.ip_address = allow_admin_login.ip_address for update;
 if attempts.window_started_at < now() - interval '15 minutes' then
   update admin_login_attempts set failures=0,window_started_at=now() where admin_login_attempts.ip_address=allow_admin_login.ip_address;
   return true;
 end if;
 return attempts.failures < 5;
end $$;
create or replace function public.record_admin_login_failure(ip_address text)
returns void language plpgsql security definer set search_path = public as $$
begin
 insert into admin_login_attempts(ip_address,failures,window_started_at) values(ip_address,1,now())
 on conflict(ip_address) do update set
 failures=case when admin_login_attempts.window_started_at < now()-interval '15 minutes' then 1 else admin_login_attempts.failures+1 end,
 window_started_at=case when admin_login_attempts.window_started_at < now()-interval '15 minutes' then now() else admin_login_attempts.window_started_at end;
end $$;
create or replace function public.clear_admin_login_failures(ip_address text)
returns void language sql security definer set search_path = public as $$
 delete from admin_login_attempts where admin_login_attempts.ip_address=clear_admin_login_failures.ip_address;
$$;
revoke all on function public.allow_admin_login(text) from public, anon, authenticated;
revoke all on function public.record_admin_login_failure(text) from public, anon, authenticated;
revoke all on function public.clear_admin_login_failures(text) from public, anon, authenticated;
grant execute on function public.allow_admin_login(text) to service_role;
grant execute on function public.record_admin_login_failure(text) to service_role;
grant execute on function public.clear_admin_login_failures(text) to service_role;
