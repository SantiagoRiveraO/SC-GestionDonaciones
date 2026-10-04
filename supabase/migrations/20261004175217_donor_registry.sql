-- Registro de donantes y aportes calculados desde las donaciones actuales.
create view public.donor_overview with (security_invoker = true) as
with counts as (
  select donor_id, count(*) as donation_count,
    count(*) filter (where kind = 'money') as money_count,
    count(*) filter (where kind = 'supplies') as supplies_count,
    max(donated_at) as last_donation_date
  from public.donations where donor_id is not null group by donor_id
), money as (
  select donor_id, currency, sum(amount) as total
  from public.donations
  where donor_id is not null and kind = 'money'
  group by donor_id, currency
), totals as (
  select donor_id, jsonb_object_agg(currency, total) as money_totals
  from money group by donor_id
)
select donor.id, donor.full_name, donor.email, donor.phone, donor.notes,
  donor.created_at, donor.updated_at,
  coalesce(counts.donation_count, 0::bigint) as donation_count,
  coalesce(counts.money_count, 0::bigint) as money_count,
  coalesce(counts.supplies_count, 0::bigint) as supplies_count,
  counts.last_donation_date,
  coalesce(totals.money_totals, '{}'::jsonb) as money_totals
from public.donors donor
left join counts on counts.donor_id = donor.id
left join totals on totals.donor_id = donor.id;

revoke all on public.donor_overview from public, anon;
grant select on public.donor_overview to authenticated;

create function public.search_donors(
  p_query text default null,
  p_sort text default 'frequency',
  p_currency text default 'USD'
)
returns setof public.donor_overview
language sql stable security invoker set search_path = '' as $$
  select donor.* from public.donor_overview donor
  where nullif(btrim(p_query), '') is null
    or strpos(lower(donor.full_name), lower(btrim(p_query))) > 0
    or strpos(lower(coalesce(donor.email, '')), lower(btrim(p_query))) > 0
    or strpos(lower(coalesce(donor.phone, '')), lower(btrim(p_query))) > 0
  order by
    case when p_sort = 'money' then coalesce((donor.money_totals ->> upper(btrim(p_currency)))::numeric, 0) end desc,
    case when p_sort = 'recent' then donor.last_donation_date end desc nulls last,
    case when p_sort is null or p_sort not in ('money', 'recent', 'name') then donor.donation_count end desc,
    lower(donor.full_name), donor.id;
$$;

revoke execute on function public.search_donors(text, text, text) from public, anon;
grant execute on function public.search_donors(text, text, text) to authenticated;
