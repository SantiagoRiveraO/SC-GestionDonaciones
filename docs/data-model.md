# Modelo de datos — FUNMIAVEN

El sistema nace vacío: no hay migración de donaciones históricas. Los tipos TypeScript se derivan de `src/types/supabase.ts` en `src/types/database.ts`.

## Diccionario de datos

### `profiles`

Extiende `auth.users`. Una fila por usuario autenticado. El trigger `on_auth_user_created` la crea al registrarse.

| Campo | Tipo | Obligatorio | Default | Restricciones y relaciones |
|-------|------|-------------|---------|----------------------------|
| `id` | `uuid` | sí | — | PK. FK a `auth.users(id)` `on delete cascade` |
| `full_name` | `text` | no | — | Viene de `raw_user_meta_data.full_name` al crear el usuario |
| `role` | `text` | sí | `'staff'` | `check`: `'admin'` o `'staff'` |
| `created_at` | `timestamptz` | sí | `now()` | — |
| `updated_at` | `timestamptz` | sí | `now()` | Lo actualiza el trigger `profiles_set_updated_at` |

### `donors`

| Campo | Tipo | Obligatorio | Default | Restricciones y relaciones |
|-------|------|-------------|---------|----------------------------|
| `id` | `uuid` | sí | `gen_random_uuid()` | PK |
| `full_name` | `text` | sí | — | `char_length(btrim(full_name))` entre 1 y 200. Índice único `lower(btrim(full_name))` |
| `email` | `text` | no | — | Máximo 320 caracteres |
| `phone` | `text` | no | — | Máximo 40 caracteres |
| `notes` | `text` | no | — | Máximo 2000 caracteres |
| `created_by` | `uuid` | no | — | FK a `auth.users(id)` `on delete set null`. Lo fija el trigger; no cambia en UPDATE |
| `updated_by` | `uuid` | no | — | FK a `auth.users(id)` `on delete set null`. Lo fija el trigger |
| `created_at` | `timestamptz` | sí | `now()` | No cambia en UPDATE |
| `updated_at` | `timestamptz` | sí | `now()` | Lo actualiza el trigger |

### `donations`

| Campo | Tipo | Obligatorio | Default | Restricciones y relaciones |
|-------|------|-------------|---------|----------------------------|
| `id` | `uuid` | sí | `gen_random_uuid()` | PK |
| `donor_id` | `uuid` | no | — | FK a `donors(id)` `on delete set null` |
| `amount` | `numeric(12, 2)` | sí | — | `amount >= 0` |
| `currency` | `text` | sí | `'USD'` | Tres letras mayúsculas: `^[A-Z]{3}$` |
| `donated_at` | `date` | sí | `current_date` | `>= 2000-01-01`. El trigger rechaza fechas futuras |
| `method` | `text` | no | — | Máximo 50 caracteres |
| `concept` | `text` | no | — | Máximo 200 caracteres |
| `notes` | `text` | no | — | Máximo 2000 caracteres |
| `created_by` | `uuid` | no | — | FK a `auth.users(id)` `on delete set null`. Lo fija el trigger; no cambia en UPDATE |
| `updated_by` | `uuid` | no | — | FK a `auth.users(id)` `on delete set null`. Lo fija el trigger |
| `created_at` | `timestamptz` | sí | `now()` | No cambia en UPDATE |
| `updated_at` | `timestamptz` | sí | `now()` | Lo actualiza el trigger |

### `audit_log`

`actor_id` no tiene FK para sobrevivir al borrado del usuario. Solo lo escribe el trigger `audit_row_change`.

| Campo | Tipo | Obligatorio | Default | Restricciones y relaciones |
|-------|------|-------------|---------|----------------------------|
| `id` | `bigint` | sí | identity | PK |
| `table_name` | `text` | sí | — | Nombre de la tabla auditada (`donors` o `donations`) |
| `record_id` | `uuid` | sí | — | `id` de la fila afectada |
| `action` | `text` | sí | — | `check`: `'INSERT'`, `'UPDATE'` o `'DELETE'` |
| `actor_id` | `uuid` | no | — | `auth.uid()` en el momento del cambio. Sin FK |
| `occurred_at` | `timestamptz` | sí | `now()` | — |
| `old_data` | `jsonb` | no | — | Fila previa en UPDATE y DELETE |
| `new_data` | `jsonb` | no | — | Fila nueva en INSERT y UPDATE |

## Diagrama ER

```mermaid
erDiagram
  auth_users ||--|| profiles : "id"
  auth_users ||--o{ donors : "created_by / updated_by"
  auth_users ||--o{ donations : "created_by / updated_by"
  donors ||--o{ donations : "donor_id"
  donors ||--o{ audit_log : "record_id"
  donations ||--o{ audit_log : "record_id"

  profiles {
    uuid id PK
    text full_name
    text role
    timestamptz created_at
    timestamptz updated_at
  }

  donors {
    uuid id PK
    text full_name
    text email
    text phone
    text notes
    uuid created_by FK
    uuid updated_by FK
    timestamptz created_at
    timestamptz updated_at
  }

  donations {
    uuid id PK
    uuid donor_id FK
    numeric amount
    text currency
    date donated_at
    text method
    text concept
    text notes
    uuid created_by FK
    uuid updated_by FK
    timestamptz created_at
    timestamptz updated_at
  }

  audit_log {
    bigint id PK
    text table_name
    uuid record_id
    text action
    uuid actor_id
    timestamptz occurred_at
    jsonb old_data
    jsonb new_data
  }
```

`auth.users` vive en el esquema `auth` de Supabase. `profiles.id` es la misma UUID.

## RLS por tabla y rol

`anon` no tiene políticas. `audit_log` solo lo lee un admin; lo escribe el trigger (revocado INSERT/UPDATE/DELETE a `anon` y `authenticated`).

| Tabla / vista | anon | staff (`authenticated`) | admin (`authenticated` + `profiles.role = 'admin'`) |
|---------------|------|-------------------------|-----------------------------------------------------|
| `profiles` | no ve filas | SELECT | igual que staff |
| `donors` | no ve filas | SELECT, INSERT, UPDATE. Sin DELETE | igual que staff |
| `donations` | no ve filas | SELECT, INSERT, UPDATE, DELETE | igual que staff |
| `donation_list` | no ve filas | lee lo que RLS permite en `donations` (vista `security_invoker`) | igual que staff |
| `audit_log` | sin GRANT | GRANT SELECT, pero RLS oculta todas las filas. No puede escribir | SELECT de todas las filas |

Las funciones de consulta (`search_donations`, `donation_summary`, `donation_filter_options`, `ensure_donor`) se ejecutan como `authenticated`. `anon` no tiene `EXECUTE`.

## Triggers y trazabilidad

| Trigger | Tabla | Cuándo | Efecto |
|---------|-------|--------|--------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | Crea `profiles` con rol `staff` |
| `*_set_updated_at` | `profiles`, `donors`, `donations` | BEFORE UPDATE | `updated_at = now()` |
| `*_set_actor_columns` | `donors`, `donations` | BEFORE INSERT/UPDATE | INSERT: `created_by` y `updated_by` = `auth.uid()`. UPDATE: `updated_by` = `auth.uid()`, conserva `created_by` y `created_at` |
| `donations_check_donation_date` | `donations` | BEFORE INSERT/UPDATE | Rechaza `donated_at` posterior a `current_date` |
| `*_audit_row_change` | `donors`, `donations` | AFTER INSERT/UPDATE/DELETE | Inserta una fila en `audit_log` con el actor (`auth.uid()`), `old_data` y `new_data` |

## Vista y funciones de consulta

### `donation_list`

Vista de `donations` con `donor_name`, `created_by_name` y `updated_by_name` (joins a `donors` y `profiles`). `security_invoker = true`: aplica el RLS del caller.

### `search_donations(p_query, p_currency, p_method, p_from, p_to)`

Devuelve filas de `donation_list`. El texto busca en concepto, método, notas, moneda y nombre del donante (sin comodines: `%` y `_` son literales). La moneda compara en mayúsculas; el método, sin distinguir mayúsculas. El rango de fechas es inclusivo.

### `donation_summary(...)`

Mismos filtros que `search_donations`. Devuelve `currency`, `total` y `donation_count` por moneda.

### `donation_filter_options()`

JSON `{"currencies": [...], "methods": [...]}` con valores distintos, ordenados.

### `ensure_donor(p_full_name)`

Crea o reutiliza un donante por `lower(btrim(full_name))`. Nombre vacío o solo espacios → `null`.

### Ejemplo con supabase-js

```ts
const { data: rows, error } = await supabase.rpc("search_donations", {
  p_query: "útiles",
  p_currency: "USD",
  p_method: "Efectivo",
  p_from: "2026-01-01",
  p_to: "2026-12-31",
});

const { data: summary } = await supabase.rpc("donation_summary", {
  p_query: "útiles",
  p_currency: "USD",
  p_method: null,
  p_from: "2026-01-01",
  p_to: "2026-12-31",
});

const { data: options } = await supabase.rpc("donation_filter_options");

const { data: donorId } = await supabase.rpc("ensure_donor", {
  p_full_name: "Carmen Rivas",
});

const { data: list } = await supabase
  .from("donation_list")
  .select("id, amount, currency, donor_name, created_by_name")
  .order("donated_at", { ascending: false });
```

## Cómo correrlo en local

1. `npm run db:start` — levanta Supabase local.
2. `npm run db:reset` — aplica `supabase/migrations/` y `supabase/seed.sql`.
3. `npm run db:test` — corre las pruebas pgTAP en `supabase/tests/database/`.

El seed es solo para desarrollo. Nunca se aplica en producción. La contraseña de los usuarios de prueba está en `supabase/seed.sql`.
