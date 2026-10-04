# Backend / Supabase (Emilio)

## Responsabilidad
- Proyecto Supabase (dev y producción)
- Migraciones de **esquema** en `migrations/`
- Auth + políticas RLS
- Seeds sintéticos en `seed.sql` (solo QA local)
- Documentar el contrato en `docs/data-model.md` y `docs/data-contract.md`

## Importante
No hay importación de donaciones históricas. Las migraciones crean tablas vacías. **El seed nunca se aplica en producción.**

## Flujo local
1. `npm run db:start` — levanta la pila local (API en `127.0.0.1:54321`, Postgres en `54322`).
2. `npm run db:reset` — reaplica `migrations/` y carga `seed.sql`.
3. `npm run db:test` — corre pgTAP en `tests/database/`.
4. Copiar `.env.example` a `.env.local` y poner ahí `API_URL` y `ANON_KEY` de `npx supabase status` como `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (nunca el service role en el cliente).

También se puede usar `node_modules\.bin\supabase.cmd` con `start`, `db reset` y `test db`.

## Usuarios de prueba
Quedan en `supabase/seed.sql` (solo local):

- `admin@funmiaven.test` — rol `admin` (`Ana Torres`)
- `staff@funmiaven.test` — rol `staff` (`Luis Pérez`)

La contraseña común está en `supabase/seed.sql`. No la copies a otros archivos.

## Linear
Epic: [MUN-21](https://linear.app/mundosonrisa-sc/issue/MUN-21/back-epic-supabase-auth-rls-y-datos)
