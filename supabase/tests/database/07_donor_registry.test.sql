begin;
select plan(16);
set local request.jwt.claims to '{"sub":"a0000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;

insert into public.donors (id, full_name, email, phone) values
  ('d7070000-0000-4000-8000-000000000001', 'QxDon A%_ frecuente', 'prueba@example.test', '0414 707 0001'),
  ('d7070000-0000-4000-8000-000000000002', 'QxDon B mayor aporte', null, null),
  ('d7070000-0000-4000-8000-000000000003', 'QxDon C sin aportes', null, null);
insert into public.donations (donor_id, kind, amount, currency, item_description, donated_at) values
  ('d7070000-0000-4000-8000-000000000001', 'money', 10, 'USD', null, '2024-01-01'),
  ('d7070000-0000-4000-8000-000000000001', 'money', 1000, 'VES', null, '2024-02-01'),
  ('d7070000-0000-4000-8000-000000000001', 'supplies', null, null, 'Harina', '2024-03-01'),
  ('d7070000-0000-4000-8000-000000000001', 'supplies', null, null, 'Ropa', '2024-04-01'),
  ('d7070000-0000-4000-8000-000000000002', 'money', 50, 'USD', null, '2025-01-01'),
  ('d7070000-0000-4000-8000-000000000002', 'money', 30, 'EUR', null, '2025-02-01'),
  (null, 'money', 10000, 'USD', null, '2025-03-01');

select is((select donation_count from public.donor_overview where id = 'd7070000-0000-4000-8000-000000000001'), 4::bigint, 'cuenta dinero e insumos');
select is((select supplies_count from public.donor_overview where id = 'd7070000-0000-4000-8000-000000000001'), 2::bigint, 'cuenta insumos aparte');
select is((select money_totals from public.donor_overview where id = 'd7070000-0000-4000-8000-000000000001'), '{"USD":10,"VES":1000}'::jsonb, 'no mezcla monedas ni dinero anónimo');
select is((select donation_count from public.donor_overview where id = 'd7070000-0000-4000-8000-000000000003'), 0::bigint, 'incluye donantes sin aportes');
select is((select money_totals from public.donor_overview where id = 'd7070000-0000-4000-8000-000000000003'), '{}'::jsonb, 'sin dinero no inventa importes');
select is((select id from public.search_donors('QxDon', 'frequency') limit 1), 'd7070000-0000-4000-8000-000000000001'::uuid, 'destaca mayor número de donaciones');
select is((select id from public.search_donors('QxDon', 'money', 'USD') limit 1), 'd7070000-0000-4000-8000-000000000002'::uuid, 'ordena aporte USD solamente');
select is((select id from public.search_donors('QxDon', 'money', 'ves') limit 1), 'd7070000-0000-4000-8000-000000000001'::uuid, 'ordena VES sin comparar con USD');
select is((select id from public.search_donors('QxDon', 'recent') limit 1), 'd7070000-0000-4000-8000-000000000002'::uuid, 'ordena última donación');
select is((select count(*) from public.search_donors('%_')), 1::bigint, 'búsqueda usa caracteres literales');
select is((select count(*) from public.search_donors('0414 707 0001')), 1::bigint, 'busca teléfono');
select is((select count(*) from public.search_donors('prueba@example.test')), 1::bigint, 'busca correo');
update public.donors set full_name = 'QxDon A renombrado', phone = '0414 707 0002' where id = 'd7070000-0000-4000-8000-000000000001';
select is((select count(*) from public.donation_list where donor_id = 'd7070000-0000-4000-8000-000000000001' and donor_name = 'QxDon A renombrado'), 4::bigint, 'editar nombre conserva historial');
select throws_ok($$insert into public.donors(full_name) values (' qxdon A RENOMBRADO ')$$, '23505', null, 'no duplica nombre por mayúsculas o espacios');
set local role anon;
select throws_ok($$select * from public.donor_overview$$, '42501', null, 'anon no lee datos ni ranking');
select throws_ok($$select * from public.search_donors()$$, '42501', null, 'anon no ejecuta búsqueda');
select * from finish();
rollback;
