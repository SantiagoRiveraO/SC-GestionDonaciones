# Backend / Supabase (Emilio)

## Responsabilidad
- Proyecto Supabase (dev y producción)
- Migraciones de **esquema** en `migrations/`
- Auth + políticas RLS
- Seeds sintéticos en `seed.sql` (solo QA)
- Documentar contrato de datos para Front

## Importante
No hay importación de donaciones históricas. Las migraciones crean tablas vacías.

## Flujo sugerido
1. Crear proyecto en Supabase
2. Aplicar `migrations/20260804000000_initial_schema.sql`
3. Completar RLS, índices y triggers
4. Crear usuarios de prueba en Auth
5. Compartir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con Carlos (nunca el service role en el cliente)
6. Marcar avance en Linear: MUN-5 → MUN-6 → MUN-9 → …

## Linear
Epic: [MUN-21](https://linear.app/mundosonrisa-sc/issue/MUN-21/back-epic-supabase-auth-rls-y-datos)
