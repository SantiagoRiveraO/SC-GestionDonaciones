# SC · Gestión de Donaciones (FUNMIAVEN)

Sistema web interno para registrar y consultar donaciones de la Fundación Milagro de Amor para Venezuela.

**Stack:** Next.js (TypeScript) + Supabase (Auth, Postgres, RLS) · Deploy: Vercel  
**Repo:** https://github.com/SantiagoRiveraO/SC-GestionDonaciones  
**Linear:** https://linear.app/mundosonrisa-sc/project/sistema-web-de-gestion-de-donaciones-funmiaven-6d41d850cd6e  
**Entrega:** 1 de septiembre de 2026

## Importante
- **No hay migración de donaciones históricas.** La organización no llevaba registro. El sistema arranca vacío.
- Seeds = datos falsos solo para pruebas.
- Secretos nunca van al repo (usar `.env.local`).

## Roles
| Persona | Área | Carpeta / foco | Epic Linear |
|---------|------|----------------|-------------|
| Emilio | Backend / Supabase | `supabase/`, contrato de datos | [MUN-21](https://linear.app/mundosonrisa-sc/issue/MUN-21/back-epic-supabase-auth-rls-y-datos) |
| Carlos | Frontend / Next.js | `src/` | [MUN-22](https://linear.app/mundosonrisa-sc/issue/MUN-22/front-epic-nextjs-ui-e-integracion) |
| Santiago | Seguimiento | Linear | Lead del proyecto |

## Arranque local
```bash
git clone https://github.com/SantiagoRiveraO/SC-GestionDonaciones.git
cd SC-GestionDonaciones
npm install
cp .env.example .env.local
# Completar URL y anon key de Supabase (Emilio)
npm run dev
```

Abre http://localhost:3000

## Estructura
```
src/
  app/                 # Rutas: /, /login, /donations, /donations/new
  components/          # UI reutilizable (Carlos — MUN-7+)
  lib/supabase/        # Clientes browser/server + middleware + env
  types/database.ts    # Contrato de tipos compartido
supabase/
  migrations/          # SQL de esquema (Emilio)
  seed.sql             # Seeds de QA
  README.md
docs/
  data-contract.md
  CONTRIBUTING.md
```

Rutas base listas (stubs hasta MUN-7/MUN-12). Sin `NEXT_PUBLIC_SUPABASE_*` en `.env.local` los clientes fallan con un mensaje explícito.

## Por dónde empezar
1. Abrir su épica en Linear y expandir subtareas.
2. Empezar por el **MUN más bajo desbloqueado** de su área:
   - **Emilio:** MUN-5 → MUN-6
   - **Carlos:** MUN-8 → MUN-7
3. Trabajar en una rama `feature/mun-X-descripcion`, push y PR a `main`.
4. Comentar en la issue: `hecho / bloqueo / siguiente paso`.

## Docs útiles
- [Contrato de datos](docs/data-contract.md)
- [Contribuir / Git](docs/CONTRIBUTING.md)
- [Backend Supabase](supabase/README.md)
