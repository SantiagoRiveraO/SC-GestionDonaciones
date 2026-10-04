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
- Tipografía **Atkinson Hyperlegible**, diseñada por el Braille Institute para personas con baja visión. Nada de cursivas ni texto justificado.
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
- El método de pago se elige con botones grandes con ícono (Efectivo, Transferencia, Pago móvil, Zelle, En especie). "Otro" abre un campo de texto.
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
- **Colores de la fundación** en variables CSS, en un solo lugar (`src/app/globals.css`):
  - `--brand` es el color principal (botones y enlaces activos);
  - `--brand-strong` es el hover;
  - `--brand-soft` es el fondo suave de las tarjetas destacadas;
  - `--brand-contrast` es el texto sobre `--brand`.
  - Mientras llegan los colores oficiales se usa un rosa oscuro cálido, `#9F1239`, que da 7,6:1 sobre blanco.
- **Logo**: `public/logo.svg`. Mientras llega el oficial hay un marcador de posición (un corazón con "FUNMIAVEN"). Para cambiarlo basta con reemplazar el archivo.
- Fondo general blanco hueso. Tarjetas blancas con bordes redondeados (12 px) y sombra suave.
- Íconos de `lucide-react`, siempre acompañados de texto y nunca solos.
- Los estados vacíos llevan ilustración o ícono, una frase amable y el botón para empezar: "Todavía no hay donaciones. ¡Registra la primera!"

## 6. Teléfono
- Todo debe funcionar en 360 px de ancho, sin scroll horizontal.
- En el teléfono, el menú del encabezado se vuelve una barra inferior fija con las tres opciones grandes.
- Las listas se ven como tarjetas.
