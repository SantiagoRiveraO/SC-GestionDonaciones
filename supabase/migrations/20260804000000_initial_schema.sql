-- Migración inicial de esquema (vacío de datos).
-- No importa donaciones históricas: la organización no llevaba registro.
-- Emilio: completar tipos, índices, RLS y triggers de updated_at.

-- profiles: extiende auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- donors
create table if not exists public.donors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  notes text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- donations
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references public.donors (id) on delete set null,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  donated_at date not null default current_date,
  method text,
  concept text,
  notes text,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TODO Emilio:
-- 1) enable row level security
-- 2) policies: solo autenticados pueden CRUD
-- 3) índices por donated_at, donor_id
-- 4) trigger updated_at
