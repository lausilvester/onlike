# Sistema de diseño de onlike.ar

Describe cómo están hechas las páginas hoy (noviembre de 2026). El diseño lo decide Laura. Si un pedido o una herramienta, por ejemplo una skill de frontend, propone cambiar algo de esto, avisar antes y no aplicarlo sin su OK.

Para una página nueva, copiar la estructura de la nota más reciente (`informacion-turistica-infraestructura-destino.html`) en lugar de diseñar desde cero.

## Colores

| Uso | Color |
|---|---|
| Fondo oscuro principal: portada de cada nota y secciones oscuras | navy `#131625` |
| Fondo profundo y pie | `#0b0d18` |
| Fondos claros: cuerpo de las notas y secciones claras | blanco `#FFFFFF` y gris claro `#F4F4F0` |
| Texto sobre fondo claro | tinta `#1F1F2E` |
| Lima | `#C8FF00`. Botón principal, filete izquierdo de 3px en destacados y cajas de cierre, y el dato principal o positivo de un gráfico |
| Violeta | `#8E51B9`. Links, notas al pie y números sobre fondo claro |
| Lavanda | `#A08AE5`. Links, números y etiquetas sobre fondo oscuro |
| Magenta | `#FF3EBE`. El dato negativo o ausente dentro de un gráfico y las posdatas de las notas. También el acento de `diagnosticotur.html` y el botón del Test Turismo en `links.html` |
| Verde | `#25D366`. Solo el botón flotante de WhatsApp |

No se usan secciones enteras en lima ni en violeta.

## Tipografía

- Outfit, una sola familia, en pesos 300, 400, 500 y 700.
- Titular de nota: `clamp(1.95rem, 3.8vw, 3.1rem)`, peso 700 con una parte en 300, interlineado 1.05.
- Bajada: 1.12rem, peso 300, interlineado 1.75, blanco al 68%.
- Cuerpo de nota: 1.04rem, interlineado 1.85, tinta al 78%.
- Subtítulos (h2): `clamp(1.5rem, 2.6vw, 2.05rem)`, peso 700.
- Frase destacada: `clamp(1.35rem, 2.4vw, 1.85rem)`, peso 300, con filete lima a la izquierda.
- Ningún texto de lectura por debajo de 0.8rem.
- Nunca una palabra pintada de otro color ni en cursiva dentro de un titular.

## Estructura de una nota

1. Encabezado fijo blanco con logo y menú, igual en todas las páginas, y botón "Escribime" a WhatsApp.
2. Portada navy en columna angosta de 820px: titular, bajada y datos de la nota (autora y fecha).
3. Cuerpo sobre fondo blanco en la misma columna: subtítulos, párrafos, figuras, tablas y destacados.
4. Caja de cierre en gris claro con filete lima, notas al pie numeradas con ancla de ida y vuelta, y firma "Acerca de mí" con foto y redes.
5. Sección navy con botón lima y botones de borde.
6. Pie en `#0b0d18`.

Botones y cajas con radio de 2px. En celular, margen lateral de 1.5rem y sin scroll horizontal.

## Gráficos

- SVG embebido en el HTML, con `<title>` y `<desc>` completos y la fuente Outfit.
- Panel navy. `viewBox` de 640 de ancho en las notas nuevas y de 720 en las anteriores; esquinas de 2px en las nuevas y de 10px en las anteriores.
- Titular con dos pesos (200 y 700), subtítulo en 300 al 60% de opacidad, filas con el rótulo a la izquierda y el valor a la derecha, y líneas separadoras en blanco al 10%.
- Colores de datos: lima para lo principal o positivo, lavanda para lo intermedio o neutro, magenta para lo negativo o ausente. Los gráficos de datos neutros de las notas nuevas usan lavanda y violeta.
- La fuente y el límite del dato van en el pie del gráfico o en el `figcaption`. Un dato no se muestra con más precisión que la de su fuente.
- Referencia: los gráficos de `que-contesta-la-ia-sobre-el-turismo-en-eldorado.html`.

## Animación

- Como máximo una animación por página, y solo en páginas de servicio.
- Tiene que mostrar la idea del servicio. Si es decoración, no va.
- Se hace en SVG con animación por código, sin texto adentro: el texto queda en el HTML.
- Se detiene con `prefers-reduced-motion` y muestra una pose fija que se entienda sola.
- Nada de textos que aparecen al hacer scroll ni efectos en cada tarjeta.
- Referencia: el viajero con la valija en `como-te-ve-un-viajero.html`.

## Contenido fijo

- Trayectoria: más de veinte años en el sector turístico; los últimos quince, también como docente (desde 2011).
- Licenciada en Turismo por la Universidad Nacional de Misiones, 2007.
- Las credenciales aparecen una sola vez por página.
- Sin minutos, tiempos de lectura ni estimaciones de duración.
- Teléfono en los datos estructurados: `+543751566488`.
- El párrafo marcado como "Quick Answer" en el index no se modifica sin revisar GEO.

## Antes de publicar

- Foco visible para teclado (`:focus-visible`) y respeto de `prefers-reduced-motion`.
- La foto principal sin `loading="lazy"`.
- Probar en celular.
- Misma barra de menú y mismo pie que el resto.
- `<title>` de hasta 60 caracteres y descripción de 120 a 155.
- Sumar la página al `sitemap.xml` y, si es una nota, al índice de `notas.html` y a `llms.txt`, con su imagen de 1200 × 630 en `assets/`.

## Pendiente de definir por Laura

Hoy varias páginas usan etiquetas pequeñas en mayúsculas con espaciado, pastillas redondeadas y chips de credenciales. Una versión anterior de este archivo los prohibía. Laura decide si se mantienen o se retiran.
