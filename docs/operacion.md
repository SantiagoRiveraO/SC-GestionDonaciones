# Operación (fundación)

Para quien administre el acceso y los datos. La app no tiene pantalla de usuarios: todo esto se hace en el panel de Supabase (y, si aplica, en Vercel).

## Crear un usuario

1. En Supabase: **Authentication → Users → Add user → Create new user**.
2. Marca **Auto Confirm User**.
3. El perfil se crea solo en la tabla `profiles`, con rol `staff`.
4. En **Table Editor → `profiles`**, completa `full_name` y, si corresponde, cambia el rol a `admin` (si no, déjalo en `staff`).

Roles posibles: `staff` o `admin`. En la app ambos pueden registrar, editar y borrar donaciones. Solo `admin` puede leer `audit_log`.

## Quitar el acceso

Borra el usuario en **Authentication → Users**.

Sus donaciones **quedan**. En el detalle, **Registrada** y **Última edición** muestran `un usuario eliminado` si ya no hay nombre. La auditoría conserva el `actor_id` de ese usuario (no se borra con él).

## Contraseñas

- La app **no tiene** “olvidé mi contraseña”.
- El correo de recuperación de Supabase solo funciona si configuraste un **SMTP propio**. El SMTP por defecto de Supabase solo envía a miembros del equipo del proyecto.
- Sin SMTP: borra el usuario en Authentication y créalo de nuevo (vuelve al paso de crear usuario). El perfil nuevo nace otra vez como `staff`.

## Secretos

Dónde viven:

- **Vercel → Settings → Environment Variables:** `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Panel de Supabase → Project Settings → API:** la misma URL, la anon key y el **service role**.

Qué nunca se comparte:

- El **service role**. No va en Vercel, ni en el repo, ni por chat.
- Contraseñas de las personas.
- Un `.env.local` con valores reales.

La anon key es pública (va en el navegador). La protección es RLS, no el secreto de esa clave.

Si hay que **rotar la anon key**: en el panel de Supabase genera una nueva, actualiza las variables en Vercel (y el `.env.local` de quien desarrolle) y vuelve a desplegar. La clave vieja deja de servir.

## Auditoría

Tabla `audit_log`. La escribe la base al crear, editar o borrar un donante o una donación. En la app no hay pantalla para verla.

- **Table Editor → `audit_log`**, o
- **SQL Editor**, por ejemplo para una donación:

```sql
select id, action, actor_id, occurred_at, old_data, new_data
from public.audit_log
where table_name = 'donations'
  and record_id = '00000000-0000-0000-0000-000000000000'
order by occurred_at;
```

Cambia el `record_id` por el `id` de la donación (lo ves en la URL: `/donations/...`). Solo un usuario `admin` puede leer esta tabla por la API; en el Table Editor del panel usas el rol de servicio del proyecto.

## Respaldo y exportación

- En el **plan gratuito** no se descargan respaldos desde el panel.
- Exportar una tabla a **CSV**: Table Editor → la tabla → exportar CSV (`donations`, `donors`, `profiles`, `audit_log`).
- Volcado completo del proyecto enlazado (procedimiento oficial de Supabase; pide la contraseña de la base). Incluye los usuarios de Authentication:

```bash
npx supabase db dump --linked -f roles.sql --role-only
npx supabase db dump --linked -f esquema.sql
npx supabase db dump --linked -f datos.sql --use-copy --data-only
```

Guarda los tres archivos fuera de Supabase. Tienen datos personales y donaciones: no los compartas.

## Restauración

1. Crea un proyecto nuevo en Supabase.
2. Copia su cadena de conexión (Project Settings → Database → Connection string) y carga los tres archivos en una sola transacción. `session_replication_role = replica` apaga triggers y claves foráneas mientras se cargan los datos, para que no se dupliquen auditorías ni falle el orden de las tablas:

```bash
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file roles.sql --file esquema.sql \
  --command "SET session_replication_role = replica" \
  --file datos.sql \
  --dbname "<cadena-de-conexion>"
```

3. En Authentication del proyecto nuevo, vuelve a desactivar el registro público y revisa la Site URL: esos ajustes no viajan en el volcado.
4. En Vercel, apunta las variables a la URL y la anon key del proyecto nuevo y vuelve a desplegar.

Necesitas `psql` (cliente de PostgreSQL) instalado en la PC que restaura.

## Si algo falla

- **La web no carga o da error 500:** Vercel → el proyecto → **Logs** (y **Deployments** si falló el build).
- **No entra nadie / errores de login:** Supabase → **Logs** (Auth). Confirma que el signup público siga apagado y el proveedor Email activo.
- **Se ve la app pero no hay datos o no guarda:** Supabase → **Logs** (API / Postgres). Revisa que las migraciones estén aplicadas (`db push`) y que el usuario exista en `profiles`.
