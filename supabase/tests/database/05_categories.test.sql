begin;
select plan(12);
set local request.jwt.claims to '{"sub":"a0000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;

insert into public.donations (id, kind, category, item_description, quantity, unit, amount, currency, concept)
values
  ('b5050000-0000-4000-8000-000000000001', 'supplies', 'food', 'Sacos de harina', 3, 'sacos', null, null, 'QxCat'),
  ('b5050000-0000-4000-8000-000000000002', 'supplies', 'clothing', 'Ropa de bebé', null, null, null, null, 'QxCat'),
  ('b5050000-0000-4000-8000-000000000003', 'supplies', null, 'Artículos variados', null, null, null, null, 'QxCat');

select is((select category from public.donation_list where id = 'b5050000-0000-4000-8000-000000000001'), 'food', 'vista muestra categoría');
select is((select count(*) from public.search_donations(p_query := 'QxCat', p_category := 'food')), 1::bigint, 'filtra por alimentos');
select is((select count(*) from public.search_donations(p_query := 'QxCat')), 3::bigint, 'categoría opcional no excluye donaciones');
select is((select donation_count from public.donation_summary(p_query := 'QxCat', p_category := 'food')), 1::bigint, 'resumen usa el mismo filtro');
select is((select total from public.donation_summary(p_query := 'QxCat', p_category := 'food')), 0::numeric, 'no inventa valor monetario');
select is((select count(*) from public.search_donations(p_query := 'Sacos de harina', p_category := 'clothing')), 0::bigint, 'combina texto y categoría');
select throws_ok($$insert into public.donations (kind, category, item_description, amount, currency) values ('supplies', 'inventada', 'Ropa', null, null)$$, '23503', null, 'rechaza categoría desconocida');
select throws_ok($$insert into public.donations (kind, category, amount, currency) values ('money', 'food', 10, 'USD')$$, '23514', null, 'dinero no lleva categoría de insumos');
update public.donations set category = null where id = 'b5050000-0000-4000-8000-000000000001';
select is((select count(*) from public.search_donations(p_query := 'QxCat', p_category := 'food')), 0::bigint, 'permite quitar categoría');
select is((select count(*) from public.search_donations(p_query := 'QxCat')), 3::bigint, 'quitar categoría conserva la donación');
select ok(not has_function_privilege('anon', 'public.search_donations(text,text,text,date,date,text,text)', 'EXECUTE'), 'anon no ejecuta búsqueda');
select ok(not has_function_privilege('anon', 'public.donation_summary(text,text,text,date,date,text,text)', 'EXECUTE'), 'anon no ejecuta resumen');
select * from finish();
rollback;
