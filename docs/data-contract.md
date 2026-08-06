# Contrato de datos — FUNMIAVEN

## Regla
No hay migración de donaciones históricas. El sistema nace vacío.

## Tablas mínimas (semana 1)
| Tabla | Propósito |
|-------|-----------|
| `profiles` | Perfil de usuario autenticado |
| `donors` | Donantes |
| `donations` | Donaciones registradas |

Tipos TypeScript de referencia: `src/types/database.ts`

## Auth
- Supabase Auth (email/password o el método que acuerde Emilio)
- Solo usuarios autenticados acceden al panel
- RLS obligatorio en `donors` y `donations`

## Estados de UI esperados (Carlos)
- loading / empty / success / error en listados y formularios
- empty es un estado válido al inicio (sin datos históricos)
