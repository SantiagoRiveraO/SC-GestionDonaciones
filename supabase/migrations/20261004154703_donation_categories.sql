-- Categoría opcional para insumos; no importa ni transforma donaciones.
alter table public.donations
  add column category text,
  add constraint donations_category_allowed check (
    category is null or (
      kind = 'supplies' and category in ('food', 'clothing', 'medicine', 'hygiene', 'school', 'other')
    )
  );
-- Añade las columnas al final para conservar los nombres y permisos de la vista.
create or replace view public.donation_list
with (security_invoker = true) as
select
  d.id, d.donor_id, d.amount, d.currency, d.donated_at, d.method,
  d.concept, d.notes, d.created_by, d.updated_by, d.created_at, d.updated_at,
  donors.full_name as donor_name,
  creator.full_name as created_by_name,
  editor.full_name as updated_by_name,
  d.kind, d.item_description, d.quantity, d.unit, d.category
from public.donations d
left join public.donors on donors.id = d.donor_id
left join public.profiles creator on creator.id = d.created_by
left join public.profiles editor on editor.id = d.updated_by;

drop function public.donation_summary(text, text, text, date, date, text);
drop function public.search_donations(text, text, text, date, date, text);

create function public.search_donations(
  p_query text default null,
  p_currency text default null,
  p_method text default null,
  p_from date default null,
  p_to date default null,
  p_kind text default null,
  p_category text default null
)
returns setof public.donation_list
language sql stable security invoker set search_path = ''
as $$
  select d.*
  from public.donation_list d
  where (
    nullif(btrim(p_query), '') is null
    or strpos(lower(coalesce(d.concept, '')), lower(btrim(p_query))) > 0
    or strpos(lower(coalesce(d.method, '')), lower(btrim(p_query))) > 0
    or strpos(lower(coalesce(d.notes, '')), lower(btrim(p_query))) > 0
    or strpos(lower(coalesce(d.currency, '')), lower(btrim(p_query))) > 0
    or strpos(lower(coalesce(d.donor_name, '')), lower(btrim(p_query))) > 0
    or strpos(lower(coalesce(d.item_description, '')), lower(btrim(p_query))) > 0
    or strpos(lower(coalesce(d.unit, '')), lower(btrim(p_query))) > 0
  )
  and (nullif(btrim(p_currency), '') is null or d.currency = upper(btrim(p_currency)))
  and (nullif(btrim(p_method), '') is null or lower(d.method) = lower(btrim(p_method)))
  and (p_from is null or d.donated_at >= p_from)
  and (p_to is null or d.donated_at <= p_to)
  and (nullif(btrim(p_kind), '') is null or d.kind = p_kind)
  and (nullif(btrim(p_category), '') is null or d.category = p_category);
$$;

create function public.donation_summary(
  p_query text default null,
  p_currency text default null,
  p_method text default null,
  p_from date default null,
  p_to date default null,
  p_kind text default null,
  p_category text default null
)
returns table (currency text, total numeric, donation_count bigint, kind text)
language sql stable security invoker set search_path = ''
as $$
  select found.currency, coalesce(sum(found.amount), 0), count(*), found.kind
  from public.search_donations(p_query, p_currency, p_method, p_from, p_to, p_kind, p_category) found
  group by found.kind, found.currency
  order by found.kind, found.currency;
$$;

revoke execute on function
  public.search_donations(text, text, text, date, date, text, text),
  public.donation_summary(text, text, text, date, date, text, text)
from public, anon;

grant execute on function
  public.search_donations(text, text, text, date, date, text, text),
  public.donation_summary(text, text, text, date, date, text, text)
to authenticated;
