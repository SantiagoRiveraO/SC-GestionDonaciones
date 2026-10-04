# Contrato de datos — FUNMIAVEN

El diccionario de campos, RLS, triggers, vista y funciones está en [`docs/data-model.md`](./data-model.md).

## Regla
No hay migración de donaciones históricas. El sistema nace vacío. El seed (`supabase/seed.sql`) es solo local y nunca se aplica en producción.

## Qué existe ahora
| Objeto | Propósito |
|--------|-----------|
| `profiles` | Perfil de `auth.users` (`admin` o `staff`) |
| `donors` | Donantes. Nombre único ignorando mayúsculas y espacios |
| `donations` | Donaciones registradas |
| `audit_log` | Trazabilidad de INSERT/UPDATE/DELETE en `donors` y `donations` |
| `donation_list` | Vista de donaciones con `donor_name`, `created_by_name` y `updated_by_name` |
| `search_donations` | Búsqueda con texto, moneda, método y rango de fechas |
| `donation_summary` | Totales y conteos por moneda (mismos filtros) |
| `donation_filter_options` | Monedas y métodos distintos |
| `ensure_donor` | Crea o reutiliza un donante por nombre |

Tipos TypeScript: `src/types/database.ts` (derivados de `src/types/supabase.ts`, generado con `supabase gen types typescript --local`).

## Auth
- Supabase Auth (email/password)
- Solo usuarios autenticados acceden al panel
- RLS en las cuatro tablas: `anon` no ve ni escribe; `staff` opera donaciones y donantes (sin borrar donantes ni editar perfiles ni leer `audit_log`); `admin` además lee `audit_log`

## Estados de UI esperados (Carlos)
- loading / empty / success / error en listados y formularios
- empty es un estado válido al inicio (sin datos históricos)
