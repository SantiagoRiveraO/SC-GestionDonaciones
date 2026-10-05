# Revisión de interfaz móvil — 5 de octubre de 2026

Se simplificaron el formulario de donaciones, Inicio, las listas y el menú inferior siguiendo las guías enlazadas en `docs/ux-guia.md`. Los campos adicionales y el orden de donantes se presentan mediante controles expandibles. Se conservaron la selección por ID, los avisos de posibles duplicados y las categorías editables.

## Comprobaciones

- Revisión visual con componentes reales y datos ficticios en una aplicación temporal local, eliminada antes de compilar. No se crearon registros en producción ni se modificaron esquemas, autenticación o permisos.
- Formulario a 320 y 360 px, listas e Inicio a 360 px, e Inicio a 1280 px: sin desplazamiento horizontal en las vistas revisadas.
- Alternar Dinero e Insumos conserva los valores introducidos. Solo los controles del tipo elegido se envían al guardar.
- Más detalles puede cerrarse sin borrar valores; al editar una donación con método y concepto, aparece abierto.
- Más filtros y Ordenar donantes muestran sus opciones al abrirse.
- Las tarjetas de insumos conservan su descripción y cantidad; las fichas de donantes conservan los contactos y los enlaces al historial.
- ESLint: correcto. Vitest: 80 pruebas correctas en 9 archivos. Compilación de producción, incluyendo TypeScript: correcta.

La prueba local de esta revisión no incluyó guardar mediante una sesión autenticada de Supabase. Las acciones del servidor y las comprobaciones de identidad conservan sus pruebas existentes. La extensión Dark Reader modificó los colores del navegador durante la revisión visual; la aplicación mantiene su paleta y contraste definidos en CSS.
