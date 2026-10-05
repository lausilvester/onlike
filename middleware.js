// Vercel Routing Middleware (sitio estático, sin framework).
// Si un pedido trae "Accept: text/markdown", la home responde con index.md
// y las rutas inexistentes responden 404 con 404.md.
// Los navegadores nunca piden text/markdown, así que el HTML no cambia.

export const config = {
  matcher: [
    '/((?!assets/|.*\\.(?:png|jpe?g|webp|gif|svg|ico|css|js|pdf|txt|xml|json|md|woff2?)$).*)',
  ],
};

const PROBE_HEADER = 'x-onlike-md-probe';
const HOME_PATHS = new Set(['/', '/index.html', '/index']);

// Lee el q de un tipo de medio dentro del header Accept (0 si no está).
function qualityOf(accept, type) {
  let best = 0;
  for (const part of accept.split(',')) {
    const [media, ...params] = part.trim().toLowerCase().split(';');
    if (media.trim() !== type) continue;
    let q = 1;
    for (const p of params) {
      const [k, v] = p.trim().split('=');
      if (k === 'q') q = Number.parseFloat(v);
    }
    if (!Number.isNaN(q) && q > best) best = q;
  }
  return best;
}

export function prefersMarkdown(accept) {
  if (!accept) return false;
  const md = qualityOf(accept, 'text/markdown');
  return md > 0 && md >= qualityOf(accept, 'text/html');
}

function markdownResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function loadMarkdown(fetchImpl, base, path) {
  const res = await fetchImpl(new URL(path, base), {
    headers: { accept: 'text/plain', [PROBE_HEADER]: '1' },
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text.trim() ? text : null;
}

export async function handle(request, fetchImpl = fetch) {
  if (request.headers.get(PROBE_HEADER)) return undefined;
  if (!prefersMarkdown(request.headers.get('accept'))) return undefined;

  const url = new URL(request.url);

  if (HOME_PATHS.has(url.pathname)) {
    const md = await loadMarkdown(fetchImpl, url, '/index.md');
    return md ? markdownResponse(md, 200) : undefined;
  }

  // Para otras rutas, se consulta si existen. Si no, 404 en Markdown.
  const probe = await fetchImpl(url, {
    method: 'HEAD',
    redirect: 'manual',
    headers: { accept: 'text/html', [PROBE_HEADER]: '1' },
  });
  if (probe.status !== 404) return undefined;

  const md = await loadMarkdown(fetchImpl, url, '/404.md');
  return markdownResponse(
    md || '# Página no encontrada (404)\n\nVolver a https://onlike.ar/ o leer https://onlike.ar/llms.txt\n',
    404,
  );
}

export default function middleware(request) {
  return handle(request);
}
