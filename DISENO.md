# Sistema de diseño de onlike.ar

Leer antes de crear o modificar cualquier página del sitio. Si algo de lo que se pide contradice este archivo, avisar antes de hacerlo.

## Colores

| Uso | Color |
|---|---|
| Fondo oscuro principal | navy `#131625` |
| Fondo profundo y pie | `#0b0d18` |
| Fondos claros | blanco `#FFFFFF` y gris claro `#F4F4F0` |
| Lima | `#C8FF00`. Solo en el botón principal y en el punto final del titular de la portada |
| Violeta | `#8E51B9`. Links y números sobre fondo claro |
| Lavanda | `#A08AE5`. Links y números sobre fondo oscuro |
| Verde | `#25D366`. Solo el botón flotante de WhatsApp |
| Magenta | `#FF3EBE`. Dentro de los gráficos, para marcar lo que falta o cae. Y el acento de `diagnosticotur.html` |

No se usan bloques lima a sangre ni secciones enteras en violeta.

El magenta tiene dos usos y son los únicos: señalar el dato negativo adentro de un gráfico (*fuera de toda recomendación*, *−0,9%*, *sin acceso*) y el acento de `diagnosticotur.html`. Fuera de ahí no entra.

En `test-turismo.html` el lima también marca la respuesta elegida. Es la única excepción y vale solo ahí; el puntaje del resultado va en blanco. En ese test el botón flotante de WhatsApp se oculta mientras se responde, para que no tape las opciones.

En `links.html` el botón del Test Turismo va en magenta. Es el único uso del magenta en esa página y el único botón lleno.

## Tipografía

- Outfit en pesos 300, 400 y 700. Una sola familia.
- Escala de siete tamaños: 0.8 / 0.9 / 1 / 1.25 / 1.6 / 2.4 rem y el titular grande con `clamp()`.
- Titulares con contraste de peso: una parte en 300 y otra en 700. Ejemplo: "Buenas reseñas." en bold y "Pocas consultas." liviano.
- Nunca una palabra pintada de otro color ni en cursiva dentro de un titular. La excepción son los dos formularios, `diagnostico.html` y `diagnosticotur.html`, donde la última palabra va en el acento de la página.
- Ningún texto de lectura por debajo de 0.8rem.

## Lo que no va

- Etiquetas en mayúsculas con espaciado arriba de los títulos.
- Pastillas redondeadas (radio 100px). Todo lleva radio 2px, salvo el botón de WhatsApp.
- Flechas en botones. La única flecha permitida es la de "Leer la nota →".
- Chips de credenciales.
- Brillos o degradés decorativos de fondo.
- Numeración 01 / 02 / 03 si el contenido no es una secuencia real.
- Separadores con punto medio ("A · B · C") en etiquetas visibles.

## Estructura

- Las secciones alternan navy, blanco y gris claro.
- Un solo elemento fuerte por página. Todo lo demás, sobrio.
- Contenido alineado a la izquierda, líneas de menos de 80 caracteres.
- Funciona en celular, con 16px de margen lateral y sin scroll horizontal.

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
- Revisar que el lima aparezca solo en el botón principal y en el punto del titular.
- Revisar que la nueva página tenga el mismo menú y el mismo pie que el resto.
- Sumar la página al `sitemap.xml` y, si es una nota, al índice de `notas.html` y a `llms.txt`.
