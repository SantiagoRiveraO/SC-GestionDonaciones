begin;
select plan(16);
set local request.jwt.claims to '{"sub":"a0000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;

insert into public.donations (id, kind, item_description, quantity, unit, amount, currency, concept)
values
  ('b4040000-0000-4000-8000-000000000001', 'supplies', 'QxSup arroz', 2.5, 'kg', null, null, 'QxSup'),
  ('b4040000-0000-4000-8000-000000000002', 'supplies', 'QxSup ropa', null, null, null, null, 'QxSup'),
  ('b4040000-0000-4000-8000-000000000003', 'money', null, null, null, 50, 'USD', 'QxSup');

select is((select count(*) from public.search_donations(p_query := 'QxSup', p_kind := 'supplies')), 2::bigint, 'filtro de insumos');
select is((select count(*) from public.search_donations(p_query := 'QxSup', p_kind := 'money')), 1::bigint, 'filtro de dinero');
select is((select count(*) from public.search_donations(p_query := 'QxSup arroz')), 1::bigint, 'busca descripción de insumos');
select is((select quantity from public.donation_list where id = 'b4040000-0000-4000-8000-000000000001'), 2.5::numeric, 'vista incluye cantidad');
select is((select total from public.donation_summary(p_query := 'QxSup') where kind = 'money'), 50::numeric, 'total de dinero no mezcla insumos');
select is((select donation_count from public.donation_summary(p_query := 'QxSup') where kind = 'supplies'), 2::bigint, 'resumen cuenta insumos con y sin cantidad');
select is((select currency from public.donation_summary(p_query := 'QxSup') where kind = 'supplies'), null::text, 'insumos sin moneda');

select throws_ok($$insert into public.donations (kind, amount, currency) values ('money', null, 'USD')$$, '23514', null, 'dinero exige monto');
select throws_ok($$insert into public.donations (kind, amount, currency) values ('money', 10, null)$$, '23514', null, 'dinero exige moneda');
select throws_ok($$insert into public.donations (kind, amount, currency) values ('supplies', null, null)$$, '23514', null, 'insumos exigen descripción');
select throws_ok($$insert into public.donations (kind, item_description, amount, currency) values ('supplies', 'Ropa', 10, 'USD')$$, '23514', null, 'insumos no tienen dinero ficticio');
select throws_ok($$insert into public.donations (kind, item_description, quantity, unit, amount, currency) values ('supplies', 'Arroz', 0, 'kg', null, null)$$, '23514', null, 'cantidad positiva');
select throws_ok($$insert into public.donations (kind, item_description, quantity, amount, currency) values ('supplies', 'Arroz', 10, null, null)$$, '23514', null, 'cantidad necesita unidad');
select throws_ok($$insert into public.donations (kind, amount, currency, method) values ('money', 10, 'USD', 'En especie')$$, '23514', null, 'en especie no es método de pago');

update public.donations set kind = 'money', item_description = null, quantity = null, unit = null, amount = 20, currency = 'USD' where id = 'b4040000-0000-4000-8000-000000000001';
select is((select total from public.donation_summary(p_query := 'QxSup', p_kind := 'money')), 70::numeric, 'cambiar tipo actualiza el resumen');
select ok(not has_function_privilege('anon', 'public.search_donations(text,text,text,date,date,text,text)', 'EXECUTE'), 'anon no ejecuta búsqueda nueva');

select * from finish();
rollback;
