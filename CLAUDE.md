# Reglas de trabajo en este repositorio

Este repositorio es el sitio onlike.ar de Laura Silvester y es público. Estas reglas valen para Claude y para cualquier otra herramienta que lo modifique. Las decide Laura.

## Reglas duras

1. **Sin firma de IA.** Los commits y las descripciones de pull request no llevan "Co-Authored-By", ni "Generated with", ni autor "Claude". Se commitea con la identidad de git de Laura; si no hay una configurada, preguntar.
2. **Nada se sube sin el OK de Laura.** Trabajar en una rama. No empujar a `main`, no abrir un pull request y no mergear sin su aprobación expresa. Cuando haya un pull request, pasarle el link con el detalle completo de todo lo que cambia.
3. **GitHub manda.** Partir siempre de un clon nuevo de este repositorio. Las copias locales de la computadora pueden estar desactualizadas.
4. **El diseño lo decide Laura.** Leer `DISENO.md` antes de crear o modificar una página. No cambiar colores, tipografía ni estructura, ni aplicar propuestas de una skill de frontend, sin su OK.

## Páginas y notas nuevas

- Copiar la estructura de la nota más reciente, no armar una desde cero.
- Sumar la página a `sitemap.xml`; si es una nota, también al índice de `notas.html` y a `llms.txt`.
- Imagen para compartir de 1200 × 630 en `assets/og-*.png`.
- Datos estructurados completos: artículo, autora, organización, migas de pan y citas de las fuentes.
- `<title>` de hasta 60 caracteres y descripción de 120 a 155.
- Foco visible para teclado y respeto de `prefers-reduced-motion`. Probar en celular.
- Correr los tests de a un archivo: `node --test tests/<archivo>.test.mjs`.

## Contenido

- Ningún dato sin fuente. Cada cifra lleva su fuente, su mercado y sus límites en una nota al pie.
- Sin promesas sobre inteligencias artificiales: no se asegura que una IA recomiende, cite o posicione a nadie.
- Sin plazos ni estimaciones de tiempo en los textos que lee un cliente.
- Las credenciales de Laura aparecen una sola vez por página.
- Un único correo de contacto: lau@onlike.ar.
