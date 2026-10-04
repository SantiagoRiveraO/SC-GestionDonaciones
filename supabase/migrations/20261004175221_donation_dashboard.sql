-- Una sola lectura consistente; respeta las políticas del personal conectado.
create function public.get_donation_dashboard(
  p_kind text default 'all', p_currency text default 'USD'
)
returns jsonb language sql stable security invoker set search_path = '' as $$
with totals as (
  select count(*) as total,
    count(*) filter (where kind = 'money') as money,
    count(*) filter (where kind = 'supplies') as supplies,
    count(*) filter (where donor_id is null) as unnamed
  from public.donations
), money as (
  select currency, sum(amount) as total from public.donations
  where kind = 'money' group by currency
), ranked_donors as (
  select id, full_name as label,
    case p_kind
      when 'money' then coalesce((money_totals ->> upper(btrim(p_currency)))::numeric, 0)
      when 'supplies' then supplies_count
      else donation_count end as value
  from public.donor_overview
), top_donors as (
  select * from ranked_donors where value > 0
  order by value desc, lower(label), id limit 5
), top_items as (
  select min(d.item_description) as label,
    coalesce(c.name, 'Sin categoría') as detail, count(*) as value
  from public.donations d left join public.supply_categories c on c.id = d.category
  where d.kind = 'supplies'
  group by lower(btrim(d.item_description)), d.category, c.name
  order by count(*) desc, lower(min(d.item_description)), d.category nulls last limit 5
), top_categories as (
  select coalesce(c.name, 'Sin categoría') as label, count(*) as value
  from public.donations d left join public.supply_categories c on c.id = d.category
  where d.kind = 'supplies' group by d.category, c.name
  order by count(*) desc, lower(coalesce(c.name, 'Sin categoría')) limit 5
)
select jsonb_build_object(
  'total', totals.total, 'money_count', totals.money, 'supplies_count', totals.supplies,
  'unnamed_count', totals.unnamed,
  'money_totals', coalesce((select jsonb_object_agg(currency, total) from money), '{}'::jsonb),
  'donors', coalesce((select jsonb_agg(to_jsonb(t) order by value desc, lower(label), id) from top_donors t), '[]'::jsonb),
  'items', coalesce((select jsonb_agg(to_jsonb(t) order by value desc, lower(label), detail) from top_items t), '[]'::jsonb),
  'categories', coalesce((select jsonb_agg(to_jsonb(t) order by value desc, lower(label)) from top_categories t), '[]'::jsonb)
) from totals;
$$;
revoke execute on function public.get_donation_dashboard(text, text) from public, anon;
grant execute on function public.get_donation_dashboard(text, text) to authenticated;
