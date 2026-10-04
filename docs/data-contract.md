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
| `supply_categories` | Catálogo de categorías de insumos; el personal puede crear y renombrar |
| `audit_log` | Trazabilidad de INSERT/UPDATE/DELETE en `donors` y `donations` |
| `donation_list` | Vista de donaciones con `donor_name`, `created_by_name` y `updated_by_name` |
| `search_donations` | Búsqueda con texto, tipo, categoría, moneda, método y rango de fechas |
| `donation_summary` | Totales de dinero por moneda y conteo separado de donaciones de insumos (mismos filtros) |
| `donation_filter_options` | Monedas y métodos distintos |
| `ensure_donor` | RPC histórica de la primera implementación; la app ya no la usa para registrar donaciones |

Tipos TypeScript: `src/types/database.ts` (derivados de `src/types/supabase.ts`, generado con `supabase gen types typescript --local`).

Cada donación elige `kind`: `money` o `supplies`. Dinero exige monto y moneda. Insumos exige `item_description`, sin monto, moneda ni método de pago. `quantity` y `unit` son opcionales, pero deben indicarse juntos. Los campos de la otra modalidad se guardan en `null`, incluso al cambiar el tipo al editar. El filtro de URL `tipo` corresponde a `p_kind` en las consultas.

`category` es una referencia opcional a `supply_categories`, solo para insumos. Hay seis categorías iniciales y el personal puede crear más o renombrarlas. El ID permanece estable; `category_name` en la vista refleja el nombre actual. La descripción indica el artículo concreto. La URL usa `categoria` y las consultas `p_category`; seleccionarla filtra insumos y limpia moneda y método. RLS oculta el catálogo a visitantes anónimos; usuarios autenticados leen, crean y cambian nombres, sin cambiar IDs ni eliminar categorías.

## Auth
Las donaciones se vinculan al `donor_id` de una ficha seleccionada. Las acciones de crear y editar comprueban que exista y sea accesible antes de escribir; el nombre mostrado nunca determina la identidad. Omitir el donante requiere la opción explícita `anonymous`. El alta de donantes es una acción separada, con normalización de espacios, restricción de nombre único y aviso de posibles coincidencias por nombre o contacto. No se fusionan automáticamente fichas.

La búsqueda del selector usa `search_donors`, con diez resultados y aviso para precisar si existen más; ya no descarga un catálogo de 500 nombres. La validación monetaria rechaza separadores mal agrupados y las fechas usan Caracas en cliente y servidor.

- Supabase Auth (email/password)
- Solo usuarios autenticados acceden al panel
- RLS en las cuatro tablas: `anon` no ve ni escribe; `staff` opera donaciones y donantes (sin borrar donantes ni editar perfiles ni leer `audit_log`); `admin` además lee `audit_log`

## Estados de UI esperados (Carlos)
- loading / empty / success / error en listados y formularios
- empty es un estado válido al inicio (sin datos históricos)
