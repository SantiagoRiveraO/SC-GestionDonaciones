begin;
select plan(18);

set local request.jwt.claims to '{"sub":"a0000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;

insert into public.donors (id, full_name)
values ('b3030000-0000-4000-8000-000000000001', 'QxB3Marker Donor');

insert into public.donations (
  id,
  donor_id,
  amount,
  currency,
  donated_at,
  method,
  concept
)
values
  (
    'b3030000-0000-4000-8000-000000000011',
    'b3030000-0000-4000-8000-000000000001',
    100,
    'QXD',
    current_date - 10,
    'QxB3Metodo',
    'QxB3Sum Alpha'
  ),
  (
    'b3030000-0000-4000-8000-000000000012',
    'b3030000-0000-4000-8000-000000000001',
    50,
    'EUR',
    current_date - 5,
    'OtroQxB3',
    'QxB3Sum Beta'
  ),
  (
    'b3030000-0000-4000-8000-000000000013',
    'b3030000-0000-4000-8000-000000000001',
    25,
    'QXD',
    current_date,
    'QxB3Metodo',
    'QxB3Sum Gamma'
  ),
  (
    'b3030000-0000-4000-8000-000000000014',
    'b3030000-0000-4000-8000-000000000001',
    1,
    'USD',
    current_date,
    'QxB3Wild',
    'QxB3wild 10% extra'
  ),
  (
    'b3030000-0000-4000-8000-000000000015',
    'b3030000-0000-4000-8000-000000000001',
    1,
    'USD',
    current_date,
    'QxB3Wild',
    'QxB3wild 10X extra'
  ),
  (
    'b3030000-0000-4000-8000-000000000016',
    'b3030000-0000-4000-8000-000000000001',
    1,
    'USD',
    current_date,
    'QxB3Wild',
    'QxB3wild a_b'
  ),
  (
    'b3030000-0000-4000-8000-000000000017',
    'b3030000-0000-4000-8000-000000000001',
    1,
    'USD',
    current_date,
    'QxB3Wild',
    'QxB3wild axb'
  );

select is(
  (
    select count(*)
    from public.search_donations(p_query := 'QxB3Sum Alpha')
  ),
  1::bigint,
  'search_donations filtra texto en concepto'
);

select is(
  (
    select count(*)
    from public.search_donations(p_query := 'QxB3Marker Donor')
  ),
  7::bigint,
  'search_donations filtra texto en nombre del donante'
);

select is(
  (
    select count(*)
    from public.search_donations(p_query := 'QxB3Sum', p_currency := 'QXD')
  ),
  2::bigint,
  'search_donations filtra por moneda'
);

select is(
  (
    select count(*)
    from public.search_donations(p_query := 'QxB3Sum', p_method := 'QxB3Metodo')
  ),
  2::bigint,
  'search_donations filtra por metodo'
);

select is(
  (
    select array_agg(concept order by concept)
    from public.search_donations(
      p_query := 'QxB3Sum',
      p_from := current_date - 10,
      p_to := current_date - 10
    )
  ),
  array['QxB3Sum Alpha']::text[],
  'search_donations incluye el dia de p_from'
);

select is(
  (
    select count(*)
    from public.search_donations(
      p_query := 'QxB3Sum',
      p_from := current_date - 10,
      p_to := current_date
    )
  ),
  3::bigint,
  'search_donations incluye el dia de p_to'
);

select is(
  (
    select array_agg(concept order by concept)
    from public.search_donations(p_query := 'QxB3wild 10%')
  ),
  array['QxB3wild 10% extra']::text[],
  'un texto con % no actua como comodin'
);

select is(
  (
    select array_agg(concept order by concept)
    from public.search_donations(p_query := 'QxB3wild a_')
  ),
  array['QxB3wild a_b']::text[],
  'un texto con _ no actua como comodin'
);

select is(
  (
    select total
    from public.donation_summary(p_query := 'QxB3Sum')
    where currency = 'QXD'
  ),
  125.00,
  'donation_summary total QXD'
);

select is(
  (
    select donation_count
    from public.donation_summary(p_query := 'QxB3Sum')
    where currency = 'QXD'
  ),
  2::bigint,
  'donation_summary conteo QXD'
);

select is(
  (
    select total
    from public.donation_summary(p_query := 'QxB3Sum')
    where currency = 'EUR'
  ),
  50.00,
  'donation_summary total EUR'
);

select is(
  (
    select donation_count
    from public.donation_summary(p_query := 'QxB3Sum')
    where currency = 'EUR'
  ),
  1::bigint,
  'donation_summary conteo EUR'
);

select ok(
  public.donation_filter_options() -> 'currencies' ? 'QXD',
  'donation_filter_options devuelve monedas distintas'
);

select ok(
  public.donation_filter_options() -> 'methods' ? 'QxB3Metodo',
  'donation_filter_options devuelve metodos distintos'
);

select is(
  public.ensure_donor('  QxB3 Donor Case  '),
  public.ensure_donor('qxb3 donor case'),
  'ensure_donor reutiliza un donante aunque cambien mayusculas o espacios'
);

select is(
  public.ensure_donor('   '),
  null::uuid,
  'ensure_donor con nombre vacio devuelve null'
);

select is(
  (
    select donor_name
    from public.donation_list
    where id = 'b3030000-0000-4000-8000-000000000011'
  ),
  'QxB3Marker Donor',
  'donation_list trae donor_name'
);

select is(
  (
    select created_by_name
    from public.donation_list
    where id = 'b3030000-0000-4000-8000-000000000011'
  ),
  'Luis Pérez',
  'donation_list trae created_by_name'
);

select * from finish();
rollback;
