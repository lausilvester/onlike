# Sistema de diseño de onlike.ar

Describe cómo están hechas las páginas hoy (noviembre de 2026). El criterio que manda sobre todos los demás es que el texto se lea: contraste sólido, tamaño suficiente y aire medido. El diseño lo decide Laura. Si un pedido o una herramienta, por ejemplo una skill de frontend, propone cambiar algo de esto, avisar antes y no aplicarlo sin su OK.

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

## Texto sin transparencias

El texto va siempre en un color sólido. Nada de `rgba` ni de `opacity` en las letras: un texto a medio tono se borra en un celular a plena luz.

| Token | Hex | Sobre | Contraste | Para qué |
|---|---|---|---|---|
| `--texto-1` | `#ECEEF6` | navy | 15,5:1 | Titulares y cuerpo sobre oscuro |
| `--texto-2` | `#D7DAE4` | navy | 12,9:1 | Bajadas y apoyos sobre oscuro |
| `--texto-3` | `#AEB3C3` | navy | 8,6:1 | Fuentes, pies y metadata sobre oscuro |
| `--ink` | `#1F1F2E` | blanco | 16,2:1 | Titulares y cuerpo sobre claro |
| `--tinta-2` | `#3A3B48` | blanco | 11,1:1 | Texto secundario sobre claro |
| `--tinta-3` | `#4A4B59` | blanco | 8,6:1 | Fuentes, pies y metadata sobre claro |

Son grises con una pizca de azul, de la familia del navy. Ningún texto baja de 8:1.

**Ni blanco puro ni negro puro.** El texto sobre oscuro va en `#ECEEF6`, no en `#FFFFFF`: el blanco puro sobre navy florece y cansa la vista. El texto sobre claro va en `#1F1F2E`. El `#FFFFFF` queda solo para fondos. Para dar énfasis se usa el peso, no el brillo.

Los tokens `--texto-1`, `--texto-2`, `--texto-3`, `--ink`, `--tinta-2` y `--tinta-3` tienen que estar definidos en el `:root` de cada página. Un `var()` que apunta a un token inexistente no falla: hereda en silencio, y el texto termina del color equivocado.

## Tipografía

Outfit, una sola familia. **Ocho tamaños, tres pesos, cinco interlineados.** Todo lo que se escriba sale de acá; un valor que no esté en estas tablas no entra.

### Los ocho tamaños

Escala de razón 1,25. Cada paso se distingue del anterior sin tener que mirar dos veces.

| rem | px | Para qué |
|---|---|---|
| 0.875 | 14 | Menú, pie de página y llamadas de nota al pie. Nada del contenido |
| 1 | 16 | Texto secundario, descripciones de tarjeta, metadata, epígrafes y fuentes de gráfico |
| **1.125** | **18** | **Cuerpo de nota y bajada (la bajada en 300). El tamaño por defecto** |
| 1.375 | 22 | Frase destacada, h3 |
| 1.75 | 28 | h3 de página de servicio, encabezados de grupo |
| 2.25 | 36 | h2 |
| 2.75 | 44 | Titular de nota y de la página Notas, y títulos de sección de la home |
| 4.5 | 72 | Sin uso desde noviembre de 2026 (era el titular de la home) |

### Los titulares responsivos

Cuatro roles, y nada más. Cada uno va entre dos pasos de la escala.

| Rol | clamp | Rango |
|---|---|---|
| Titular de la home y de página de servicio | `clamp(2.25rem, 4.8vw, 3.5rem)` | 36–56px |
| Titular de nota y de la página Notas, y títulos de sección de la home | `clamp(1.75rem, 3.6vw, 2.75rem)` | 28–44px |
| h2 de notas y servicios, y título del cierre de las notas | `clamp(1.75rem, 3vw, 2.25rem)` | 28–36px |
| h3 y frase destacada | `clamp(1.375rem, 2.2vw, 1.75rem)` | 22–28px |

Una página que inventa su propio `clamp()` rompe la escala: con 34 declaraciones distintas, el sitio llegó a mostrar 19 tamaños donde el CSS declaraba 8.

### Los tres pesos

| Peso | Para qué |
|---|---|
| 300 | La parte fina del titular, y la bajada |
| 400 | Todo el cuerpo |
| 700 | Títulos, botones, etiquetas y la parte gruesa del titular |

No se usan 500, 600 ni 900. En Outfit, 500 contra 400 y 600 contra 700 casi no se distinguen: dos pesos que no se diferencian no marcan jerarquía, solo ensucian.

### Los cinco interlineados

Atados al tamaño. Cuanto más grande la letra, más cerrado el interlineado.

| Tamaño | Interlineado |
|---|---|
| 14–16px | 1.5 |
| 18px | 1.6 |
| 22–24px | 1.45 |
| 28–36px | 1.2 |
| 44px y más | 1.05 |

### Reglas

- Ningún texto de lectura por debajo de 0.875rem (14px).
- Nunca una palabra pintada de otro color ni en cursiva dentro de un titular. Excepción, pedida por Laura el 26 de noviembre de 2026: en `geo-site.html`, «como realmente es.» va resaltado con un fondo lima y tinta encima, como un marcador.
- **Un título se lee como título.** Más grande que el texto que encabeza, nunca igual ni menor. Los pisos: h2 desde 1,6 veces el cuerpo, h3 desde 1,25, h4 desde 1,12. Una pregunta de preguntas frecuentes que se ve igual que su respuesta no funciona como pregunta.
- **Largo de línea entre 60 y 80 caracteres.** Si una columna pasa de 80, se agranda la letra o se limita el ancho con `max-width` en `ch`, no en píxeles.
- El titular de la home lleva dos líneas en 300 y la tercera en 700, con el punto final en lima. Es un ritmo que atraviesa el titular entero, no una palabra resaltada.

## Aire

Grilla de nueve pasos, la misma que usa el design system para las piezas. Márgenes, padding y gap salen de acá.

`0.25 · 0.5 · 0.75 · 1 · 1.5 · 2 · 3 · 4 · 6` rem — es decir 4, 8, 12, 16, 24, 32, 48, 64 y 96px.

- Padding de sección: entre 3 y 4rem. Por encima de 5rem la página se siente vacía y obliga a scrollear de más.
- El aire separa bloques distintos. Entre cosas que van juntas, el hueco es chico.

## Las etiquetas de grupo van resaltadas

En la lista de servicios de la home, cada etiqueta de grupo va sobre un bloque lima con tinta encima (13,7:1), radio de 2px, en 28px. El resaltado es el formato de la etiqueta de grupo: marca dónde empieza cada bloque de servicios.

Los grupos son "Para negocios turísticos", "Para destinos, municipios y cámaras" y "Para cualquier negocio".

## La barra de arriba

Igual en todas las páginas: fondo blanco al 98% con desenfoque, links en 14px peso 400 con espaciado de 0.06em, y el botón "Escribime" en navy.

## El botón de WhatsApp

Verde `#25D366` con texto y ícono en tinta `#1F1F2E`: 8,2:1. El texto blanco sobre ese verde da 1,7:1 y no se lee. Se conserva el verde porque es el que la gente reconoce; lo que cambia es el texto.

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
- Titular con dos pesos (200 y 700), subtítulo en 300 sobre `--texto-3`, filas con el rótulo a la izquierda y el valor a la derecha, y líneas separadoras en blanco al 10%. Las líneas y los bordes sí pueden llevar transparencia; el texto no.
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
- En `geo-site.html` la animación es un chat: una pregunta a una IA, tres puntos de espera y la respuesta. Es una excepción a «sin texto adentro», pedida por Laura el 26 de noviembre de 2026. El texto está en el HTML desde el principio, la animación corre una sola vez al cargar y no con el scroll, y con `prefers-reduced-motion` o sin JavaScript el chat se ve completo y quieto. Lleva la aclaración «Ejemplo ilustrativo».

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
- Ningún texto con `rgba` ni `opacity`: todo sólido, con los tokens de arriba.
- Ningún título más chico que el texto que encabeza.
- Misma barra de menú y mismo pie que el resto.
- `<title>` de hasta 60 caracteres y descripción de 120 a 155.
- Sumar la página al `sitemap.xml` y, si es una nota, al índice de `notas.html` y a `llms.txt`, con su imagen de 1200 × 630 en `assets/`.

## Etiquetas, pastillas y mayúsculas

Se retiraron el 26 de noviembre de 2026, por decisión de Laura: no se usan etiquetas pequeñas en mayúsculas con espaciado, ni pastillas redondeadas, ni chips de credenciales. Tampoco rótulos en mayúsculas dentro de los gráficos: van en minúscula, sin espaciado. Las siglas (INDEC, ANAC) se escriben como siglas. Las únicas excepciones son el menú de arriba y la etiqueta «¿Es para vos?» del hero de `geo-site.html`, en mayúsculas con 0.06em de espaciado, como el menú. Laura la pidió así el 26 de noviembre de 2026.

## Aire en las notas

- Entre el menú y el titular de la portada: 6rem de padding arriba, que con el menú fijo deja unos 27px en escritorio y 35px en celular. Igual en todas las notas y en la página Notas.
- Entre la portada y el cuerpo: 2rem abajo de la portada y 2rem arriba del cuerpo.
