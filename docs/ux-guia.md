# Guía de UX: FUNMIAVEN

Quienes usan la app son señoras mayores de la fundación. Registran donaciones con calma, a veces desde el teléfono, y no son expertas en computadoras. Cada pantalla tiene que cumplir tres cosas:
- que se lea sin esfuerzo;
- que nadie se pierda;
- que un error no asuste.

Fuentes:
- [W3C, personas mayores y WCAG](https://www.w3.org/WAI/older-users/developing/)
- [Nielsen Norman Group, usabilidad para adultos mayores](https://www.nngroup.com/articles/usability-for-senior-citizens/)
- [GOV.UK, validación de formularios](https://design-system.service.gov.uk/patterns/validation/)

## 1. Leer sin esfuerzo
- Letra base de **18 px** con interlineado de 1,6. Los títulos de página van a 30–32 px.
- Tipografía **Lexend**, diseñada para facilitar la lectura: letras amplias y números muy claros. Se descartó Atkinson Hyperlegible porque tacha el cero (Ø) y confundía los montos. Nada de cursivas ni texto justificado.
- Contraste de **7:1** para el texto normal: casi negro sobre blanco. El gris claro solo se usa en textos secundarios y nunca baja de 4,5:1.
- La fecha se escribe completa donde se lee con calma, por ejemplo "4 de octubre de 2026" en el detalle. En listas se usa `dd/mm/aaaa`.
- Los montos se ven grandes y con su moneda: `USD 1.250,00`.

## 2. No perderse
- **Encabezado fijo, igual en todas las pantallas:**
  - el logo y el nombre de la fundación, que llevan al inicio;
  - tres opciones con ícono y texto: **Inicio**, **Donaciones** y **Registrar donación** (esta última destacada);
  - **Cerrar sesión**.
  - La opción actual se marca con color y subrayado, no solo con color.
- **Pantalla de inicio**: lo primero que se ve al entrar.
  - Un saludo con el nombre de la persona.
  - Dos botones grandes: "Registrar una donación" y "Ver todas las donaciones".
  - El resumen del mes en curso.
  - Las últimas 5 donaciones.
- Cada pantalla tiene un título claro y un enlace grande "← Volver a …".
- La acción principal de cada pantalla tiene siempre la misma forma: botón grande, color de la fundación, ícono más texto.
- Nunca se abren ventanas nuevas ni hay cambios automáticos de página.

## 3. Tocar y escribir sin errores
- Botones y campos de **48 px de alto** como mínimo, con al menos 12 px de separación entre ellos.
- Los formularios van en una sola columna, con la etiqueta arriba del campo.
- Cada campo con dudas posibles lleva un texto de ayuda debajo, por ejemplo: "Ejemplo: 25,50".
- Los campos opcionales dicen "(opcional)". No se usan asteriscos.
- **Monto flexible**: acepta `25,50`, `25.50`, `1.250,50` y `1250`. Lo convertimos nosotros: nunca se rechaza por el formato.
- La fecha viene puesta con la de hoy.
- Primero se elige qué se recibió con dos botones grandes: **Dinero** o **Insumos**. Los datos escritos se conservan al alternar antes de guardar.
- Dinero muestra monto, moneda y método de pago (Efectivo, Transferencia, Pago móvil, Zelle). "Otro" abre un campo de texto.
- Insumos muestra descripción (obligatoria), cantidad y unidad (opcionales, se indican juntas). Ejemplo: arroz, 2,50 kg. No requiere inventar un valor de dinero.
- La categoría de insumos es opcional: seis opciones iniciales y un catálogo editable, con controles de 64 px, etiqueta escrita y selección perceptible por forma y color. **Agregar nueva categoría** permite crearla sin salir ni perder datos y la selecciona automáticamente. **Administrar categorías** permite cambiar los nombres. En 360 px se usa una columna para evitar textos apretados. La descripción pregunta **¿Qué se recibió?** y la unidad **¿Cómo se cuenta?**. Ejemplo: Alimentos, sacos de harina, 3 sacos.
- Se toman como referencia las [recomendaciones WAI para personas mayores](https://www.w3.org/WAI/older-users/developing/) y el patrón de [etiquetas claras de W3C](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p06-clear-labels/): opciones reconocibles, ayudas visibles y lenguaje cotidiano. La validación con personal real de la fundación sigue siendo necesaria para comprobar facilidad de uso.
- Inicio y listado muestran los totales de dinero por moneda y el número de donaciones de insumos por separado. No se suman kg con cajas ni artículos distintos.
- La moneda se elige con tres botones grandes: USD, VES y EUR.

## 4. Errores que no asustan
- Se valida solo al pulsar Guardar, nunca mientras se escribe.
- Si hay errores:
  - aparece arriba un **resumen** en rojo, con un enlace a cada campo, y recibe el foco;
  - cada campo muestra su mensaje debajo;
  - no se pierde nada de lo escrito.
- Los mensajes dicen qué pasó y cómo arreglarlo. Ejemplo: "La fecha no puede ser futura. Revisa el día."
- **Confirmación antes de eliminar**: una ventana propia, no la del navegador, con el texto "¿Eliminar esta donación? No se podrá recuperar." y dos botones grandes: "Sí, eliminar" (rojo) y "No, volver".
- Los mensajes de éxito son grandes, verdes y con ícono de check. **No desaparecen solos**, porque no ponemos límites de tiempo.

## 5. Agradable a la vista
- **Colores oficiales**, tomados del logo y definidos en variables CSS en un solo lugar (`src/app/globals.css`):

  | Variable | Valor | Uso |
  |---|---|---|
  | `--brand` | `#35327F` (azul marino del nombre) | Botones principales y menú activo. Da 11:1 con texto blanco. |
  | `--brand-strong` | `#27245F` | Hover |
  | `--brand-soft` | `#EEEDF8` | Fondo de tarjetas destacadas |
  | `--accent` | `#E2234D` (rojo del corazón) | Detalles e íconos. No se usa para texto chico. |
  | `--accent-soft` | `#FDECEF` | Fondo suave de detalles |

  El azul `#476AA7` y el verde `#3DA242` del logo quedan como colores de apoyo.
- **Logos** en `public/brand/`, con fondo transparente:
  - `logo-marca.png`: el corazón solo. Va en el encabezado y es el ícono del navegador (`src/app/icon.png`).
  - `logo-funmiaven.png`: el corazón con el nombre. Va en el login.
  - `logo-milagro-de-amor.jpg`: el logo circular "Milagro de Amor por Venezuela", guardado para documentos impresos.
- Fondo general gris claro (`--page`, `#F0F2F6`). Tarjetas blancas con bordes redondeados (12 px), borde gris visible y sombra suave. Los campos y botones secundarios tienen bordes más oscuros para distinguirlos fácilmente.
- Íconos de `lucide-react`, siempre acompañados de texto y nunca solos.
- Los estados vacíos llevan ilustración o ícono, una frase amable y el botón para empezar: "Todavía no hay donaciones. ¡Registra la primera!"

## 6. Teléfono
- Todo debe funcionar en 360 px de ancho, sin scroll horizontal.
- En el teléfono, el menú del encabezado se vuelve una barra inferior fija con cinco opciones: Inicio, Donaciones, Donantes, Resumen y Registrar.
- Las listas se ven como tarjetas.

## 7. Donantes y resumen
- Donantes usa los mismos campos, mensajes de error, tarjetas y botones del resto del sistema. Solo exige un nombre.
- Las fichas permiten registrar otro aporte con el nombre rellenado y conservar el historial al editar los datos.
- Resumen tiene una opción propia en el menú y un enlace secundario en Inicio. No desplaza la acción principal de registrar donaciones.
- Las barras tienen el nombre y valor escritos al lado; el color no es la única fuente de información. Se separan las monedas y se cuentan registros de insumos, sin sumar unidades incompatibles.
