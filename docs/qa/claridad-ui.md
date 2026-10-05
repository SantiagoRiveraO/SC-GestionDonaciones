# Revisión de claridad por pantalla

5 de octubre de 2026. Cambios de presentación; consultas, autenticación, registros, permisos y clasificación del top por importe conservados.

- Donaciones: totales separados por moneda y tipo, títulos completos a 320 px, tarjetas con donante, fecha y valor distinguibles, resultados filtrados identificados y estado vacío sin un resumen redundante de ceros.
- Donantes: contactos separados de aportes, importes legibles en filas y moneda seleccionada sin duplicación al ordenar por dinero.
- Inicio: el mismo bloque de totales y las mismas tarjetas del listado, manteniendo Registrar como acción principal.
- Ficha del donante y Resumen: reutilizan los totales sin mezclar conteo de registros, importes y cantidades de artículos. Los gráficos y el top mantienen sus cálculos.
- Detalle: notas y concepto vacíos omitidos; Datos del registro abre la autoría y las fechas; Eliminar abre la confirmación y No, volver la cierra, sin ejecutar borrados.
- Categorías: abrir Alimentos muestra el campo y Guardar nombre. La revisión no ejecuta cambios en el catálogo.
- Acceso: a 320 x 800, el botón Entrar queda visible; no se envían credenciales durante la revisión.
- Paginación: botones en dos columnas en teléfono, con la página identificada arriba.

Se usó una aplicación temporal local con los componentes de producción y datos ficticios. Los bloques de composición de la ficha del donante y de Resumen se representaron con esos componentes; no se inició sesión ni se ejecutaron acciones de escritura. Anchos revisados: 320, 360 y 1280 px. Las vistas medidas no presentaron desbordamiento horizontal. La extensión Dark Reader modificó los colores de las capturas; la paleta de la aplicación sigue definida en CSS.

La aplicación temporal se elimina antes de las comprobaciones finales y de publicar. Esta revisión no acredita conformidad integral de WCAG ni pruebas de uso con personas mayores.

Comprobaciones de código: ESLint sin errores, 80 pruebas correctas en 9 archivos y compilación de producción con TypeScript correcta.
