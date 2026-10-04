begin;
select plan(11);
-- Sólo dentro de esta transacción de prueba, revertida al terminar.
delete from public.donations;
delete from public.donors;
set local request.jwt.claims to '{"sub":"a0000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;
select is(public.get_donation_dashboard()->>'total', '0', 'sistema vacío tiene cero donaciones');
select is(public.get_donation_dashboard()->'donors', '[]'::jsonb, 'sistema vacío no inventa donantes');
insert into public.donors(id,full_name) values
 ('d8080000-0000-4000-8000-000000000001', 'Ana'), ('d8080000-0000-4000-8000-000000000002', 'Bea');
insert into public.donations(donor_id,kind,amount,currency,item_description,category,quantity,unit,donated_at) values
 ('d8080000-0000-4000-8000-000000000001','money',10,'USD',null,null,null,null,current_date),
 ('d8080000-0000-4000-8000-000000000001','money',1000,'VES',null,null,null,null,current_date),
 ('d8080000-0000-4000-8000-000000000001','supplies',null,null,'Harina','food',3,'sacos',current_date),
 ('d8080000-0000-4000-8000-000000000001','supplies',null,null,' harina ','food',8,'kilos',current_date),
 ('d8080000-0000-4000-8000-000000000002','money',50,'USD',null,null,null,null,current_date),
 ('d8080000-0000-4000-8000-000000000002','supplies',null,null,'Ropa','clothing',10,'unidades',current_date),
 (null,'money',500,'USD',null,null,null,null,current_date);
select is(public.get_donation_dashboard()->'money_totals', '{"USD":560,"VES":1000}'::jsonb, 'totales incluyen anónimos y separan monedas');
select is(public.get_donation_dashboard()->'donors'->0->>'label', 'Ana', 'ranking general cuenta dinero e insumos');
select is(public.get_donation_dashboard('money','USD')->'donors'->0->>'label', 'Bea', 'ranking USD no mezcla VES ni dinero anónimo');
select is(public.get_donation_dashboard('supplies')->'donors'->0->>'value', '2', 'ranking insumos cuenta registros');
select is(public.get_donation_dashboard()->'items'->0->>'value', '2', 'agrupa descripción sin mayúsculas y espacios, sin sumar sacos y kilos');
select is(public.get_donation_dashboard()->'categories'->0->>'label', 'Alimentos', 'categorías usan nombre legible del catálogo');
insert into public.donors(id,full_name) values ('d8080000-0000-4000-8000-000000000003', 'Un aporte grande');
insert into public.donations(donor_id,kind,amount,currency,donated_at)
values ('d8080000-0000-4000-8000-000000000003','money',100000,'USD',current_date);
insert into public.donations(donor_id,kind,amount,currency,donated_at)
select 'd8080000-0000-4000-8000-000000000001'::uuid,'money',1,'USD',current_date from generate_series(1,50);
select is(public.get_donation_dashboard('money','USD')->'donors'->0->>'label', 'Un aporte grande', '100 mil dólares una vez supera cincuenta aportes de un dólar');
select is((public.get_donation_dashboard('money','USD')->'donors'->0->>'value')::numeric, 100000::numeric, 'barra representa el monto total aportado');
set local role anon;
select throws_ok($$select public.get_donation_dashboard()$$, '42501', null, 'resumen no es público');
select * from finish();
rollback;
