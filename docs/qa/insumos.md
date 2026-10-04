# Comprobación de dinero e insumos — 2026-10-04

## Automática

- 49 pruebas Vitest: formato, filtros, validación de dinero e insumos, categorías editables y presentación del resumen.
- 91 pruebas pgTAP: las 52 existentes, 16 de insumos, 12 de categorías y 11 del catálogo editable, restricciones, consultas, cambios de tipo y permisos.
- ESLint, TypeScript y compilación de Next.js: correctos.

## Navegador con Supabase local

- Login con usuario ficticio staff.
- Selección de Insumos oculta y desactiva monto, moneda y método de pago.
- Cantidad sin unidad muestra el error y conserva descripción, cantidad y tipo; el resumen recibe el foco.
- Guardado de insumos: descripción, cantidad y unidad aparecen en el detalle, con confirmación.
- Edición de insumos a dinero y de dinero a insumos: se limpian los campos de la modalidad anterior y cambia el detalle.
- Filtro de Insumos: devuelve solo insumos, cuenta las donaciones aparte y desactiva filtros de dinero.
- Listado y formulario de insumos a 360 px: sin desbordamiento horizontal y navegación inferior visible.
- Categoría seleccionada se conserva al corregir un error y al editar. Quitar categoría permite guardar sin perder descripción ni cantidad.
- Alimentos filtra el listado y su resumen juntos; la tarjeta muestra Alimentos, Sacos de harina y 3 sacos.
- Catálogo editable: agregar desde la donación conserva datos no guardados, selecciona la categoría nueva y permite guardar. Los nombres repetidos muestran un error claro. Administrar categorías permite agregar y renombrar; renombrar mantiene los vínculos con las donaciones.

## Supabase remoto

Proyecto `vwszdrprqpspqeaowhwd` (MS servicio comunitario).

- Estructura aplicada mediante el plugin de Supabase; historial alineado con el archivo SQL del repositorio.
- Verificados los campos de tipo, descripción, cantidad y unidad, y monto/moneda anulables.
- Categoría opcional aplicada también en Supabase, con filtro `p_category` compartido por búsqueda y resumen. El ejemplo de comprobación se revierte y producción conserva cero donaciones y cero donantes.
- Catálogo editable aplicado en Supabase: seis categorías iniciales; crear, vincular y renombrar verificados dentro de una transacción revertida. Producción sigue sin donaciones ni donantes y conserva solo las seis categorías iniciales.
- Comprobación de inserción y resumen dentro de una transacción revertida: dinero e insumos separados, sin permiso de ejecución para `anon`.
- Producción sigue vacía; no se cargó el seed local.
- Advisors: ningún aviso de tablas, vistas o RLS causado por este cambio. Existe un aviso de Auth por [protección de contraseñas filtradas desactivada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection); no se cambiaron ajustes de Auth.

Los cambios de interfaz se comprobaron en local. Vercel publica los cambios subidos a `main`; tras publicar, comprobar `/login` y la redirección de las rutas protegidas.
