# SC · Gestión de Donaciones (FUNMIAVEN)

Sistema web interno para registrar y consultar donaciones de la Fundación Milagro de Amor para Venezuela. El personal entra con email y contraseña, lista donaciones (25 por página), filtra, crea, edita y elimina. No hay migración de donaciones históricas: el sistema arranca vacío.

**Stack:** Next.js 16 (TypeScript) + Supabase (Auth, Postgres, RLS) · Deploy: Vercel  
**Producción:** https://sc-gestion-donaciones.vercel.app  
**Repo:** https://github.com/SantiagoRiveraO/SC-GestionDonaciones  
**Linear:** https://linear.app/mundosonrisa-sc/project/sistema-web-de-gestion-de-donaciones-funmiaven-6d41d850cd6e  
**Entrega:** 1 de septiembre de 2026

## Importante

- No hay migración de donaciones históricas. La organización no llevaba registro.
- El seed (`supabase/seed.sql`) es solo local, con datos falsos. Nunca en producción.
- Los secretos no van al repo. Usa `.env.local`. La anon key es pública; la protección es RLS. El service role no se comparte.

## Arranque rápido

Requisitos: Node 20 o más, Docker Desktop y git.

```bash
git clone https://github.com/SantiagoRiveraO/SC-GestionDonaciones.git
cd SC-GestionDonaciones
npm ci
npm run db:start
npm run db:reset
```

Copia `.env.example` a `.env.local`. De `npx supabase status` toma la URL y la anon key:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

No copies el service role.

```bash
npm run dev
```

Abre http://localhost:3000

## Pruebas

```bash
npm test          # Vitest
npm run db:test   # pgTAP
npm run lint
npm run build
```

## Documentación

- [Manual de uso](docs/manual-usuario.md) — personal que registra donaciones
- [Operación](docs/operacion.md) — usuarios, respaldos, secretos
- [Documentación técnica](docs/tecnica.md) — arquitectura, instalación, despliegue
- [Modelo de datos](docs/data-model.md)
- [Contrato de datos](docs/data-contract.md)
- [Backend Supabase](supabase/README.md)
- [Contribuir / Git](docs/CONTRIBUTING.md)
