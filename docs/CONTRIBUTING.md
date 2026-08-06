# Contribución y flujo Git

## Repo
https://github.com/SantiagoRiveraO/SC-GestionDonaciones

## Roles
- **Carlos:** `src/` (Next.js, UI, integración)
- **Emilio:** `supabase/` (migraciones, RLS, seeds) + contrato de datos
- **Santiago:** seguimiento en Linear, sin issues de implementación

## Flujo
1. Clonar el repo
2. Crear rama desde `main`:
   - `feature/mun-8-nextjs-setup` (ejemplo Carlos)
   - `feature/mun-5-schema` (ejemplo Emilio)
3. Commits claros y frecuentes
4. Push + Pull Request a `main`
5. Comentar en Linear: `hecho / bloqueo / siguiente paso`

## Secretos
- Copiar `.env.example` → `.env.local`
- Nunca subir `.env.local` ni service role keys
