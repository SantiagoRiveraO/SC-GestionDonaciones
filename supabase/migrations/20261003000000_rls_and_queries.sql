-- RLS, vista de listado y funciones de consulta.
-- anon no tiene politicas. audit_log solo lo lee un admin; lo escribe el trigger.

alter table public.profiles enable row level security;
alter table public.donors enable row level security;
alter table public.donations enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_select_authenticated
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) is not null);

create policy donors_select_authenticated
  on public.donors
  for select
  to authenticated
  using ((select auth.uid()) is not null);

create policy donors_insert_authenticated
  on public.donors
  for insert
  to authenticated
  with check ((select auth.uid()) is not null);

create policy donors_update_authenticated
  on public.donors
  for update
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

create policy donations_select_authenticated
  on public.donations
  for select
  to authenticated
  using ((select auth.uid()) is not null);

create policy donations_insert_authenticated
  on public.donations
  for insert
  to authenticated
  with check ((select auth.uid()) is not null);

create policy donations_update_authenticated
  on public.donations
  for update
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

create policy donations_delete_authenticated
  on public.donations
  for delete
  to authenticated
  using ((select auth.uid()) is not null);

create policy audit_log_select_admin
  on public.audit_log
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'admin'
    )
  );

revoke all on table public.audit_log from anon, authenticated;
grant select on table public.audit_log to authenticated;

revoke execute on function
  public.handle_new_user(),
  public.audit_row_change(),
  public.set_updated_at(),
  public.set_actor_columns(),
  public.check_donation_date()
from public, anon, authenticated;

create view public.donation_list
with (security_invoker = true) as
select
  donations.id,
  donations.donor_id,
  donations.amount,
  donations.currency,
  donations.donated_at,
  donations.method,
  donations.concept,
  donations.notes,
  donations.created_by,
  donations.updated_by,
  donations.created_at,
  donations.updated_at,
  donors.full_name as donor_name,
  created_by_profile.full_name as created_by_name,
  updated_by_profile.full_name as updated_by_name
from public.donations
left join public.donors
  on donors.id = donations.donor_id
left join public.profiles as created_by_profile
  on created_by_profile.id = donations.created_by
left join public.profiles as updated_by_profile
  on updated_by_profile.id = donations.updated_by;

create function public.search_donations(
  p_query text default null,
  p_currency text default null,
  p_method text default null,
  p_from date default null,
  p_to date default null
)
returns setof public.donation_list
language sql
stable
security invoker
set search_path = ''
as $$
  with needle as (
    select
      case
        when p_query is null or pg_catalog.btrim(p_query) = ''::pg_catalog.text then null
        else '%'::pg_catalog.text || pg_catalog.lower(
          pg_catalog.replace(
            pg_catalog.replace(
              pg_catalog.replace(pg_catalog.btrim(p_query), '\'::pg_catalog.text, '\\'::pg_catalog.text),
              '%'::pg_catalog.text,
              '\%'::pg_catalog.text
            ),
            '_'::pg_catalog.text,
            '\_'::pg_catalog.text
          )
        ) || '%'::pg_catalog.text
      end as pattern,
      case
        when p_currency is null or pg_catalog.btrim(p_currency) = ''::pg_catalog.text then null
        else pg_catalog.btrim(p_currency)
      end as currency,
      case
        when p_method is null or pg_catalog.btrim(p_method) = ''::pg_catalog.text then null
        else pg_catalog.btrim(p_method)
      end as method
  )
  select donation_list.*
  from public.donation_list
  cross join needle
  where (
    needle.pattern is null
    or pg_catalog.lower(donation_list.concept) like needle.pattern escape '\'
    or pg_catalog.lower(donation_list.method) like needle.pattern escape '\'
    or pg_catalog.lower(donation_list.notes) like needle.pattern escape '\'
    or pg_catalog.lower(donation_list.currency) like needle.pattern escape '\'
    or pg_catalog.lower(donation_list.donor_name) like needle.pattern escape '\'
  )
  and (
    needle.currency is null
    or donation_list.currency = pg_catalog.upper(needle.currency)
  )
  and (
    needle.method is null
    or pg_catalog.lower(donation_list.method) = pg_catalog.lower(needle.method)
  )
  and (p_from is null or donation_list.donated_at >= p_from)
  and (p_to is null or donation_list.donated_at <= p_to);
$$;

create function public.donation_summary(
  p_query text default null,
  p_currency text default null,
  p_method text default null,
  p_from date default null,
  p_to date default null
)
returns table (currency text, total numeric, donation_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    found.currency,
    pg_catalog.sum(found.amount) as total,
    pg_catalog.count(*) as donation_count
  from public.search_donations(p_query, p_currency, p_method, p_from, p_to) as found
  group by found.currency
  order by found.currency;
$$;

create function public.donation_filter_options()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with currencies as (
    select pg_catalog.jsonb_agg(distinct_currencies.currency order by distinct_currencies.currency) as items
    from (
      select distinct donations.currency
      from public.donations
      where donations.currency is not null
        and pg_catalog.btrim(donations.currency) <> ''::pg_catalog.text
    ) as distinct_currencies
  ),
  methods as (
    select pg_catalog.jsonb_agg(distinct_methods.method order by distinct_methods.method) as items
    from (
      select distinct donations.method
      from public.donations
      where donations.method is not null
        and pg_catalog.btrim(donations.method) <> ''::pg_catalog.text
    ) as distinct_methods
  )
  select pg_catalog.jsonb_build_object(
    'currencies',
    case
      when currencies.items is null then '[]'::pg_catalog.jsonb
      else currencies.items
    end,
    'methods',
    case
      when methods.items is null then '[]'::pg_catalog.jsonb
      else methods.items
    end
  )
  from currencies
  cross join methods;
$$;

create function public.ensure_donor(p_full_name text)
returns uuid
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_name text := pg_catalog.btrim(p_full_name);
  v_id uuid;
begin
  if v_name is null or v_name = ''::pg_catalog.text then
    return null;
  end if;

  insert into public.donors (full_name)
  values (v_name)
  on conflict ((pg_catalog.lower(pg_catalog.btrim(full_name)))) do nothing
  returning id into v_id;

  if v_id is not null then
    return v_id;
  end if;

  select donors.id
  into v_id
  from public.donors
  where pg_catalog.lower(pg_catalog.btrim(donors.full_name)) = pg_catalog.lower(v_name);

  return v_id;
end;
$$;

revoke execute on function
  public.search_donations(text, text, text, date, date),
  public.donation_summary(text, text, text, date, date),
  public.donation_filter_options(),
  public.ensure_donor(text)
from public, anon;

grant execute on function
  public.search_donations(text, text, text, date, date),
  public.donation_summary(text, text, text, date, date),
  public.donation_filter_options(),
  public.ensure_donor(text)
to authenticated;
