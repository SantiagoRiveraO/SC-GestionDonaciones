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
- Top principal siempre por dinero acumulado en una moneda. Regresión con una donación de USD 100.000 frente a cincuenta de USD 1; enlaces antiguos con `tipo=all` o `tipo=supplies` no alteran el criterio del top.

Los permisos de las nuevas consultas están restringidos al personal autenticado. No se modifican las opciones de autenticación del proyecto; la observación previa de protección contra contraseñas filtradas sigue documentada en `insumos.md`.

## Selección de donantes y revisión de formularios

Corrección posterior del 4 de octubre de 2026, sin cambios de esquema ni carga de datos en producción.

- 80 pruebas Vitest y 118 pgTAP correctas, además de ESLint, TypeScript y build de producción.
- Crear y editar donaciones guardan el ID seleccionado: un nombre escrito o modificado no crea ni reasigna fichas. ID inexistente y selección ausente devuelven errores sin escribir; omitir el donante exige la opción explícita.
- Navegador local: buscar Carmen y guardar sin seleccionarla muestra error conservando monto y concepto; seleccionar la ficha y omitir monto conserva nombre y contacto.
- Alta dentro de la donación: «Carmen Rivass» propone la ficha de «Carmen Rivas», sin insertar. Alta explícita de Organización Azucenas conserva monto y concepto, queda seleccionada y permite guardar.
- Edición del aporte recién creado de dinero a insumos, con categoría nueva Equipos de huerto: conserva el ID del donante y los otros datos. Guardar se bloquea durante el alta de categorías o donantes.
- El registro independiente también advierte de coincidencias. Cambiar nombre o contacto desmarca la confirmación de que es otra persona; no se fusionan fichas automáticamente.
- Montos mal agrupados no se reinterpretan silenciosamente; las fechas se validan según Caracas incluso si UTC ya cambió de día.
