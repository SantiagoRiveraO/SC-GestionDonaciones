# Donantes y resumen

Validación del 4 de octubre de 2026. Todos los datos de las pruebas son ficticios y locales.

- 62 pruebas Vitest: validación de contactos, filtros, presentación de monedas y barras, además de los flujos existentes.
- 116 pruebas pgTAP: permisos, búsqueda literal, orden por moneda, historial al renombrar, totales sin datos, rankings y agrupación de insumos sin sumar unidades distintas.
- ESLint, TypeScript y build de producción correctos.
- Registro local de donante, error con foco en el resumen y conservación del teléfono, ficha con contacto, donación con nombre precargado y acceso a la ficha desde el detalle.
- Edición de nombre manteniendo el historial, búsqueda por teléfono y ranking del resumen por moneda e insumos.
- Menú inferior con cinco opciones legibles a 360 px; sin desbordamiento horizontal a 360, 1024 y 1280 px.
- Consultas aplicadas y verificadas en Supabase remoto; pruebas de escritura dentro de una transacción revertida, sin dejar datos ficticios en producción.
- Gráficos con eje desde cero y escala común, sin fracciones para conteos. Comparación de dinero e insumos por número de donaciones; revisión de escalas para importes pequeños y gráficos vacíos.

Los permisos de las nuevas consultas están restringidos al personal autenticado. No se modifican las opciones de autenticación del proyecto; la observación previa de protección contra contraseñas filtradas sigue documentada en `insumos.md`.
