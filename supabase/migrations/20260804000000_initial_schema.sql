-- Esquema inicial de FUNMIAVEN (base vacía, sin datos históricos).
-- Tablas profiles, donors, donations y audit_log, con restricciones,
-- triggers e índices. RLS, políticas, grants, vistas y funciones de
-- consulta quedan para una migración posterior.

-- profiles: extiende auth.users
create table public.profiles (
  id uuid primary key,
  full_name text,
  role text not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_id_fkey
    foreign key (id) references auth.users (id) on delete cascade,
  constraint profiles_role_allowed
    check (role in ('admin', 'staff'))
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    'staff'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- donors
create table public.donors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  notes text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint donors_full_name_length
    check (char_length(btrim(full_name)) between 1 and 200),
  constraint donors_email_length
    check (char_length(email) <= 320),
  constraint donors_phone_length
    check (char_length(phone) <= 40),
  constraint donors_notes_length
    check (char_length(notes) <= 2000),
  constraint donors_created_by_fkey
    foreign key (created_by) references auth.users (id) on delete set null,
  constraint donors_updated_by_fkey
    foreign key (updated_by) references auth.users (id) on delete set null
);

-- donations
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid,
  amount numeric(12, 2) not null,
  currency text not null default 'USD',
  donated_at date not null default current_date,
  method text,
  concept text,
  notes text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint donations_donor_id_fkey
    foreign key (donor_id) references public.donors (id) on delete set null,
  constraint donations_amount_nonnegative
    check (amount >= 0),
  constraint donations_currency_format
    check (currency ~ '^[A-Z]{3}$'),
  constraint donations_donated_at_min
    check (donated_at >= date '2000-01-01'),
  constraint donations_method_length
    check (char_length(method) <= 50),
  constraint donations_concept_length
    check (char_length(concept) <= 200),
  constraint donations_notes_length
    check (char_length(notes) <= 2000),
  constraint donations_created_by_fkey
    foreign key (created_by) references auth.users (id) on delete set null,
  constraint donations_updated_by_fkey
    foreign key (updated_by) references auth.users (id) on delete set null
);

-- updated_at, actor y fecha de donación
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create function public.set_actor_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
    new.updated_by := coalesce(auth.uid(), new.updated_by);
  elsif tg_op = 'UPDATE' then
    new.updated_by := coalesce(auth.uid(), new.updated_by);
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;

  return new;
end;
$$;

create function public.check_donation_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.donated_at > current_date then
    raise exception 'La fecha de la donacion no puede ser futura'
      using errcode = 'check_violation',
            constraint = 'donations_donated_at_not_future';
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger donors_set_updated_at
  before update on public.donors
  for each row
  execute function public.set_updated_at();

create trigger donations_set_updated_at
  before update on public.donations
  for each row
  execute function public.set_updated_at();

create trigger donors_set_actor_columns
  before insert or update on public.donors
  for each row
  execute function public.set_actor_columns();

create trigger donations_set_actor_columns
  before insert or update on public.donations
  for each row
  execute function public.set_actor_columns();

create trigger donations_check_donation_date
  before insert or update on public.donations
  for each row
  execute function public.check_donation_date();

-- audit_log: actor_id no tiene FK para sobrevivir al borrado del usuario
create table public.audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid not null,
  action text not null,
  actor_id uuid,
  occurred_at timestamptz not null default now(),
  old_data jsonb,
  new_data jsonb,
  constraint audit_log_action_allowed
    check (action in ('INSERT', 'UPDATE', 'DELETE'))
);

create function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_log (
    table_name,
    record_id,
    action,
    actor_id,
    old_data,
    new_data
  )
  values (
    tg_table_name,
    coalesce(new.id, old.id),
    tg_op,
    auth.uid(),
    case
      when tg_op = 'UPDATE' or tg_op = 'DELETE' then pg_catalog.to_jsonb(old)
      else null
    end,
    case
      when tg_op = 'INSERT' or tg_op = 'UPDATE' then pg_catalog.to_jsonb(new)
      else null
    end
  );

  return null;
end;
$$;

create trigger donors_audit_row_change
  after insert or update or delete on public.donors
  for each row
  execute function public.audit_row_change();

create trigger donations_audit_row_change
  after insert or update or delete on public.donations
  for each row
  execute function public.audit_row_change();

-- índices
create unique index donors_full_name_key
  on public.donors (lower(btrim(full_name)));

create index donations_donated_at_idx
  on public.donations (donated_at desc);

create index donations_donor_id_idx
  on public.donations (donor_id);

create index donations_currency_idx
  on public.donations (currency);

create index donations_created_by_idx
  on public.donations (created_by);

create index donations_updated_by_idx
  on public.donations (updated_by);

create index donors_created_by_idx
  on public.donors (created_by);

create index donors_updated_by_idx
  on public.donors (updated_by);

create index audit_log_table_name_record_id_idx
  on public.audit_log (table_name, record_id);

create index audit_log_occurred_at_idx
  on public.audit_log (occurred_at desc);
