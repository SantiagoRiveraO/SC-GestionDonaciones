begin;
select plan(18);

-- usuarios del seed
-- admin: a0000000-0000-4000-8000-000000000001
-- staff: a0000000-0000-4000-8000-000000000002

select ok(
  (
    select c.relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'profiles'
  ),
  'profiles tiene RLS activado'
);

select ok(
  (
    select c.relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'donors'
  ),
  'donors tiene RLS activado'
);

select ok(
  (
    select c.relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'donations'
  ),
  'donations tiene RLS activado'
);

select ok(
  (
    select c.relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'audit_log'
  ),
  'audit_log tiene RLS activado'
);

select throws_ok(
  $$insert into public.donations (amount, currency) values (10, 'usd')$$,
  '23514',
  null,
  'rechaza moneda en minusculas'
);

select throws_ok(
  $$insert into public.donations (amount, currency) values (-1, 'USD')$$,
  '23514',
  null,
  'rechaza monto negativo'
);

select throws_ok(
  format(
    $$insert into public.donations (amount, currency, donated_at) values (10, 'USD', %L)$$,
    (current_date + 1)::text
  ),
  '23514',
  null,
  'rechaza fecha futura'
);

select throws_ok(
  $$insert into public.donations (amount, currency, donated_at) values (10, 'USD', date '1999-12-31')$$,
  '23514',
  null,
  'rechaza fecha anterior a 2000'
);

select throws_ok(
  format(
    $$insert into public.donations (amount, currency, concept) values (10, 'USD', %L)$$,
    repeat('x', 201)
  ),
  '23514',
  null,
  'rechaza concepto de mas de 200 caracteres'
);

set local request.jwt.claims to '{"sub":"a0000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;

insert into public.donations (id, amount, currency, concept)
values (
  'b3010000-0000-4000-8000-000000000001',
  12.50,
  'USD',
  'B3 schema actor'
);

select is(
  (
    select created_by
    from public.donations
    where id = 'b3010000-0000-4000-8000-000000000001'
  ),
  'a0000000-0000-4000-8000-000000000002'::uuid,
  'insertar como usuario pone created_by'
);

select is(
  (
    select updated_by
    from public.donations
    where id = 'b3010000-0000-4000-8000-000000000001'
  ),
  'a0000000-0000-4000-8000-000000000002'::uuid,
  'insertar como usuario pone updated_by'
);

select ok(
  (
    select updated_at is not null
    from public.donations
    where id = 'b3010000-0000-4000-8000-000000000001'
  ),
  'insertar como usuario pone updated_at'
);

reset role;
set local request.jwt.claims to '{"sub":"a0000000-0000-4000-8000-000000000001","role":"authenticated"}';
set local role authenticated;

update public.donations
set
  notes = 'editado por admin',
  created_by = 'a0000000-0000-4000-8000-000000000001'
where id = 'b3010000-0000-4000-8000-000000000001';

select is(
  (
    select updated_by
    from public.donations
    where id = 'b3010000-0000-4000-8000-000000000001'
  ),
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'editar como usuario pone updated_by'
);

select ok(
  (
    select updated_at is not null
    from public.donations
    where id = 'b3010000-0000-4000-8000-000000000001'
  ),
  'editar como usuario pone updated_at'
);

select is(
  (
    select created_by
    from public.donations
    where id = 'b3010000-0000-4000-8000-000000000001'
  ),
  'a0000000-0000-4000-8000-000000000002'::uuid,
  'created_by no se puede cambiar en un UPDATE'
);

delete from public.donations
where id = 'b3010000-0000-4000-8000-000000000001';

reset role;

select ok(
  exists (
    select 1
    from public.audit_log
    where table_name = 'donations'
      and record_id = 'b3010000-0000-4000-8000-000000000001'
      and action = 'INSERT'
      and actor_id = 'a0000000-0000-4000-8000-000000000002'
  ),
  'INSERT en donations deja fila en audit_log con el actor'
);

select ok(
  exists (
    select 1
    from public.audit_log
    where table_name = 'donations'
      and record_id = 'b3010000-0000-4000-8000-000000000001'
      and action = 'UPDATE'
      and actor_id = 'a0000000-0000-4000-8000-000000000001'
  ),
  'UPDATE en donations deja fila en audit_log con el actor'
);

select ok(
  exists (
    select 1
    from public.audit_log
    where table_name = 'donations'
      and record_id = 'b3010000-0000-4000-8000-000000000001'
      and action = 'DELETE'
      and actor_id = 'a0000000-0000-4000-8000-000000000001'
  ),
  'DELETE en donations deja fila en audit_log con el actor'
);

select * from finish();
rollback;
