-- Catálogo administrable, sin importar donaciones históricas.
create table public.supply_categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supply_categories_id_format check (id ~ '^[a-zA-Z0-9_-]{1,64}$'),
  constraint supply_categories_name_length check (char_length(btrim(name)) between 1 and 80)
);
create unique index supply_categories_name_unique on public.supply_categories (lower(btrim(name)));

insert into public.supply_categories (id, name) values
  ('food', 'Alimentos'), ('clothing', 'Ropa'), ('medicine', 'Medicinas'),
  ('hygiene', 'Higiene'), ('school', 'Útiles escolares'), ('other', 'Otros');

alter table public.supply_categories enable row level security;
create policy supply_categories_select_authenticated on public.supply_categories
  for select to authenticated using ((select auth.uid()) is not null);
create policy supply_categories_insert_authenticated on public.supply_categories
  for insert to authenticated with check ((select auth.uid()) is not null);
create policy supply_categories_update_authenticated on public.supply_categories
  for update to authenticated using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);
revoke all on public.supply_categories from anon, authenticated;
-- anon tiene SELECT pero ninguna política: devuelve cero filas, igual que la vista.
grant select on public.supply_categories to anon, authenticated;
grant insert (name), update (name) on public.supply_categories to authenticated;
create trigger supply_categories_set_updated_at before update on public.supply_categories
  for each row execute function public.set_updated_at();

alter table public.donations
  drop constraint donations_category_allowed,
  add constraint donations_category_allowed check (category is null or kind = 'supplies'),
  add constraint donations_category_fkey foreign key (category) references public.supply_categories (id);
create index donations_category_idx on public.donations (category) where category is not null;

create or replace view public.donation_list with (security_invoker = true) as
select
  d.id, d.donor_id, d.amount, d.currency, d.donated_at, d.method,
  d.concept, d.notes, d.created_by, d.updated_by, d.created_at, d.updated_at,
  donors.full_name as donor_name,
  creator.full_name as created_by_name,
  editor.full_name as updated_by_name,
  d.kind, d.item_description, d.quantity, d.unit, d.category,
  category.name as category_name
from public.donations d
left join public.donors on donors.id = d.donor_id
left join public.profiles creator on creator.id = d.created_by
left join public.profiles editor on editor.id = d.updated_by
left join public.supply_categories category on category.id = d.category;
