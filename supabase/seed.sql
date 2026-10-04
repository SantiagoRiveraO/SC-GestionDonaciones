-- Solo para desarrollo local. Nunca se ejecuta en produccion.
-- Contrasena comun de ambos usuarios: funmiaven-dev

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  is_sso_user,
  is_anonymous,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  phone_change,
  phone_change_token,
  reauthentication_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'admin@funmiaven.test',
    extensions.crypt('funmiaven-dev', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ana Torres"}'::jsonb,
    false,
    false,
    false,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'staff@funmiaven.test',
    extensions.crypt('funmiaven-dev', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Luis Pérez"}'::jsonb,
    false,
    false,
    false,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  );

insert into auth.identities (
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  users.id,
  users.id::text,
  'email',
  jsonb_build_object(
    'sub', users.id::text,
    'email', users.email,
    'email_verified', true,
    'phone_verified', false
  ),
  now(),
  now(),
  now()
from auth.users
where users.email in ('admin@funmiaven.test', 'staff@funmiaven.test');

update public.profiles
set role = 'admin'
where id = 'a0000000-0000-4000-8000-000000000001';

insert into public.donors (full_name, email, phone, notes)
values
  ('Carmen Rivas', 'carmen.rivas@example.test', '+580000000001', 'Donante de prueba'),
  ('Héctor Molina', 'hector.molina@example.test', '+580000000002', null),
  ('Beatriz Colmenares', 'beatriz.colmenares@example.test', '+580000000003', null),
  ('Ignacio Fuenmayor', 'ignacio.fuenmayor@example.test', '+580000000004', null),
  ('Rosa Delgado', 'rosa.delgado@example.test', '+580000000005', null),
  ('Pablo Herrera', 'pablo.herrera@example.test', '+580000000006', null),
  ('Martina Uzcátegui', 'martina.uzcategui@example.test', '+580000000007', null),
  ('Samuel Ortega', 'samuel.ortega@example.test', '+580000000008', null);

insert into public.donations (
  donor_id,
  amount,
  currency,
  donated_at,
  method,
  concept,
  notes,
  created_by,
  updated_by
)
select
  donors.id,
  seed.amount,
  seed.currency,
  current_date - seed.days_ago,
  seed.method,
  seed.concept,
  seed.notes,
  seed.created_by,
  seed.created_by
from (
  values
    ('Carmen Rivas'::text, 80.00::numeric, 'USD', 2, 'Efectivo', 'Compra de útiles', null::text, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Héctor Molina', 120.00, 'USD', 15, 'Transferencia', 'Aporte mensual', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    ('Beatriz Colmenares', 45.00, 'EUR', 28, 'Zelle', 'Ayuda escolar', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Ignacio Fuenmayor', 2500.00, 'VES', 6, 'Pago móvil', 'Colaboración', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    ('Rosa Delgado', 60.00, 'USD', 40, 'Efectivo', 'Mercado comunitario', 'Compra de la semana', 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Pablo Herrera', 35.00, 'EUR', 55, 'En especie', 'Alimentos', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    ('Martina Uzcátegui', 1800.00, 'VES', 9, 'Transferencia', 'Jornada médica', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Samuel Ortega', 90.00, 'USD', 70, 'Zelle', 'Becas', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    ('Carmen Rivas', 25.00, 'EUR', 12, 'Efectivo', 'Transporte', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Héctor Molina', 4200.00, 'VES', 33, 'Pago móvil', 'Medicinas', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    (null, 15.00, 'USD', 4, 'Efectivo', 'Donación anónima', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Beatriz Colmenares', 200.00, 'USD', 88, 'Transferencia', 'Reparación de sede', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    ('Ignacio Fuenmayor', 70.00, 'EUR', 21, 'Zelle', 'Kit escolar', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Rosa Delgado', 3100.00, 'VES', 47, 'Pago móvil', 'Agua potable', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    (null, 10.00, 'EUR', 0, 'En especie', 'Ropa', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Pablo Herrera', 55.00, 'USD', 100, 'Efectivo', 'Refrigerios', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    ('Martina Uzcátegui', 150.00, 'USD', 64, 'Transferencia', 'Taller de oficios', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Samuel Ortega', 5000.00, 'VES', 18, 'Pago móvil', 'Insumos', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    ('Carmen Rivas', 40.00, 'EUR', 130, 'Zelle', 'Apoyo familiar', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    (null, 75.00, 'USD', 8, 'Transferencia', 'Colecta', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    ('Héctor Molina', 30.00, 'USD', 155, 'En especie', 'Útiles', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Beatriz Colmenares', 2200.00, 'VES', 36, 'Pago móvil', 'Pasajes', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    ('Ignacio Fuenmayor', 110.00, 'USD', 77, 'Efectivo', 'Juguetes', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Rosa Delgado', 65.00, 'EUR', 50, 'Zelle', 'Libros', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    ('Pablo Herrera', 6400.00, 'VES', 22, 'Transferencia', 'Obra de techo', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Martina Uzcátegui', 20.00, 'USD', 95, 'Efectivo', 'Merienda', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    (null, 8.00, 'EUR', 14, 'Zelle', 'Aporte espontáneo', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Samuel Ortega', 95.00, 'USD', 170, 'En especie', 'Frazadas', null, 'a0000000-0000-4000-8000-000000000002'::uuid),
    ('Carmen Rivas', 1600.00, 'VES', 41, 'Pago móvil', 'Consulta', null, 'a0000000-0000-4000-8000-000000000001'::uuid),
    ('Héctor Molina', 48.00, 'EUR', 60, 'Transferencia', 'Material didáctico', null, 'a0000000-0000-4000-8000-000000000002'::uuid)
) as seed (donor_name, amount, currency, days_ago, method, concept, notes, created_by)
left join public.donors
  on donors.full_name = seed.donor_name;
