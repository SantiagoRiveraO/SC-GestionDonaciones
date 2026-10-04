begin;
select plan(11);
set local request.jwt.claims to '{"sub":"a0000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;

select lives_ok($$insert into public.supply_categories (name) values ('QxEditable materiales')$$, 'staff agrega categoría con ID automático');
select is((select count(*) from public.supply_categories where name = 'QxEditable materiales'), 1::bigint, 'categoría guardada');
select throws_ok($$insert into public.supply_categories (name) values (' qxeditable MATERIALES ')$$, '23505', null, 'no duplica nombres por espacios o mayúsculas');
select throws_ok($$insert into public.supply_categories (name) values ('  ')$$, '23514', null, 'no permite nombres vacíos');
select throws_ok($$insert into public.supply_categories (name) values (repeat('x', 81))$$, '23514', null, 'limita longitud');
insert into public.donations (id, kind, category, item_description, amount, currency)
select 'b6060000-0000-4000-8000-000000000001', 'supplies', id, 'Cemento', null, null
from public.supply_categories where name = 'QxEditable materiales';
select is((select category_name from public.donation_list where id = 'b6060000-0000-4000-8000-000000000001'), 'QxEditable materiales', 'donación usa categoría nueva');
select lives_ok($$update public.supply_categories set name = 'QxEditable construcción' where name = 'QxEditable materiales'$$, 'staff cambia nombre');
select is((select category_name from public.donation_list where id = 'b6060000-0000-4000-8000-000000000001'), 'QxEditable construcción', 'renombrar actualiza el nombre de las donaciones');
select is((select count(*) from public.search_donations(p_category := (select id from public.supply_categories where name = 'QxEditable construcción'))), 1::bigint, 'filtra por ID estable después de renombrar');
select throws_ok($$update public.supply_categories set id = 'otro-id' where name = 'QxEditable construcción'$$, '42501', null, 'no cambia identidad de la categoría');
set local role anon;
select is_empty($$select * from public.supply_categories$$, 'anon no ve categorías');
select * from finish();
rollback;
