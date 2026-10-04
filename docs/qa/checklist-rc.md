# Checklist del release candidate — 2026-10-04

Se probó con Supabase local (CLI) y `next dev`, usando los datos sintéticos de `supabase/seed.sql`. La revisión de producción se hizo sobre el proyecto Supabase recién creado, todavía vacío.

## Pruebas automáticas

| Prueba | Resultado |
|---|---|
| `npm test`: 20 pruebas Vitest (validación, filtros y formato) | OK |
| `npm run db:test`: 52 pruebas pgTAP (restricciones, triggers, auditoría, RLS por rol y consultas) | OK |
| `npm run lint`, `tsc --noEmit` y `npm run build` | OK |
| `supabase db lint` | Sin errores |
| Advisors de seguridad de Supabase en producción | 0 avisos |

## Seguridad, por la API y con cada rol

| Caso | Resultado |
|---|---|
| El registro público se rechaza (local: 422 `signup_disabled`) | OK en local. **En producción está pendiente desactivarlo.** |
| Anónimo: no lee `donations`, `donors`, `profiles` ni `donation_list`; no inserta, no ejecuta funciones y no accede a `audit_log` | OK (local y producción) |
| Staff: crea, lee, edita y borra donaciones; crea y edita donantes | OK |
| Staff: no puede borrar donantes, editar perfiles, subirse a admin ni leer o escribir `audit_log` | OK |
| Admin: lee `audit_log`, con el actor de cada cambio | OK |
| `created_by` y `updated_by` los pone la base, aunque el cliente mande otro valor | OK |
| Un alta por la API de administración crea el perfil `staff` | OK |

## Flujo funcional en el navegador (escritorio y 375 px)

| Caso | Resultado |
|---|---|
| Credenciales malas: muestra "Correo o contraseña incorrectos." | OK |
| Login correcto, redirección a `next` y cierre de sesión | OK |
| Sin sesión, cualquier ruta protegida lleva a `/login?next=…` | OK |
| Listado: resumen por moneda y páginas de 25 | OK |
| Una página fuera de rango lleva a la última | OK |
| Búsqueda por donante y concepto; filtros de moneda, método y fechas | OK |
| Alta con un donante nuevo, que se reutiliza por nombre | OK |
| Una fecha futura muestra el error en el campo y conserva lo escrito | OK |
| El detalle muestra "Registrada" y "Última edición" en hora de Caracas | OK |
| Edición: "Cambios guardados." | OK |
| Eliminación con confirmación: "Donación eliminada." | OK |
| Un id inexistente o inválido muestra "No se encontró esta donación." | OK |
| En 375 px: sin scroll horizontal, tarjetas en lugar de tabla y botones de 36 px o más | OK |
| Con el sistema en modo oscuro, la app sigue clara y legible | OK |

## Rendimiento con 20.000 donaciones sintéticas

Los datos se cargaron dentro de una transacción que después se deshizo.

| Consulta | Tiempo |
|---|---|
| Búsqueda por texto (`search_donations`) | 76 ms |
| Filtro por moneda y desde una fecha | 5 ms |
| Resumen completo (`donation_summary`) | 13 ms |

## Defectos encontrados y corregidos

- `auth.email.enable_signup = false` apagaba también el login por correo (config local). Ahora el registro se bloquea solo con `[auth] enable_signup = false`.
- Tras un error de validación, la moneda volvía a USD. Ahora se conserva.
- Una página fuera de rango mostraba "Página 99 de 2". Ahora redirige a la última.
- Los montos mezclaban símbolos ("Bs.S" y "VES"). Ahora usan un formato único: `VES 1.234,00`.
- El servidor mostraba las horas en UTC. Ahora se muestran en hora de Caracas.
- El modo oscuro del sistema dejaba texto ilegible. Ahora la app es siempre clara.

## Pendiente para producción

- Desactivar el registro público en Supabase: Authentication → Sign In / Providers → "Allow new users to sign up".
- Configurar la Site URL con la URL de Vercel.
- Crear los usuarios reales.
- Hacer el smoke test (login y CRUD) en la URL de producción.
