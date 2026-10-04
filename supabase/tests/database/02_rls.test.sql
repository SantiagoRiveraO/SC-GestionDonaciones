begin;
select plan(16);

insert into public.donors (id, full_name)
values ('b3020000-0000-4000-8000-000000000001', 'B3 RLS Donor');

insert into public.donations (id, donor_id, amount, currency, concept)
values (
  'b3020000-0000-4000-8000-000000000010',
  'b3020000-0000-4000-8000-000000000001',
  10,
  'USD',
  'B3 RLS Donation'
);

set local role anon;

select is_empty(
  'select * from public.donations',
  'anon no ve filas de donations'
);

select is_empty(
  'select * from public.donors',
  'anon no ve filas de donors'
);

select is_empty(
  'select * from public.profiles',
  'anon no ve filas de profiles'
);

select is_empty(
  'select * from public.donation_list',
  'anon no ve filas de donation_list'
);

select throws_ok(
  $$insert into public.donations (amount, currency) values (1, 'USD')$$,
  '42501',
  null,
  'anon no puede insertar'
);

reset role;
set local request.jwt.claims to '{"sub":"a0000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;

select isnt_empty(
  $$select * from public.donations where id = 'b3020000-0000-4000-8000-000000000010'$$,
  'staff puede leer donaciones'
);

select lives_ok(
  $$insert into public.donations (amount, currency, concept)
    values (3, 'USD', 'B3 staff create')$$,
  'staff puede crear donaciones'
);

select lives_ok(
  $$update public.donations
    set notes = 'editado'
    where concept = 'B3 staff create'$$,
  'staff puede editar donaciones'
);

select lives_ok(
  $$delete from public.donations where concept = 'B3 staff create'$$,
  'staff puede borrar donaciones'
);

select lives_ok(
  $$insert into public.donors (full_name) values ('B3 staff donor')$$,
  'staff puede crear donantes'
);

select lives_ok(
  $$update public.donors
    set notes = 'nota staff'
    where full_name = 'B3 staff donor'$$,
  'staff puede editar donantes'
);

delete from public.donors where full_name = 'B3 staff donor';

select ok(
  exists (
    select 1
    from public.donors
    where full_name = 'B3 staff donor'
  ),
  'staff no puede borrar donantes'
);

update public.profiles
set full_name = 'No permitido'
where id = 'a0000000-0000-4000-8000-000000000002';

select is(
  (
    select full_name
    from public.profiles
    where id = 'a0000000-0000-4000-8000-000000000002'
  ),
  'Luis Pérez',
  'staff no puede editar perfiles'
);

select is_empty(
  'select * from public.audit_log',
  'staff no puede leer audit_log'
);

select throws_ok(
  $$insert into public.audit_log (table_name, record_id, action)
    values ('donations', 'b3020000-0000-4000-8000-000000000010', 'INSERT')$$,
  '42501',
  null,
  'staff no puede escribir audit_log'
);

reset role;
set local request.jwt.claims to '{"sub":"a0000000-0000-4000-8000-000000000001","role":"authenticated"}';
set local role authenticated;

select isnt_empty(
  $$select * from public.audit_log
    where record_id = 'b3020000-0000-4000-8000-000000000010'$$,
  'admin puede leer audit_log'
);

select * from finish();
rollback;
