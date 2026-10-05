// Ejecutar con: node --test tests/agent-readiness.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handle, prefersMarkdown } from '../middleware.js';

const root = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, root), 'utf8');

// fetch simulado: sirve los .md del repo y responde 404 a rutas desconocidas
function fakeFetch(existing = ['/', '/notas.html']) {
  return async (url, init = {}) => {
    const { pathname } = new URL(url);
    if (pathname.endsWith('.md')) return new Response(read(pathname.slice(1)), { status: 200 });
    if (existing.includes(pathname)) return new Response(init.method === 'HEAD' ? null : 'html', { status: 200 });
    return new Response(null, { status: 404 });
  };
}
const req = (path, accept) => new Request(`https://onlike.ar${path}`, { headers: accept ? { accept } : {} });

test('detecta preferencia por Markdown', () => {
  assert.equal(prefersMarkdown('text/markdown'), true);
  assert.equal(prefersMarkdown('text/markdown, text/html;q=0.8'), true);
  assert.equal(prefersMarkdown('text/html,application/xhtml+xml,*/*;q=0.8'), false);
  assert.equal(prefersMarkdown('text/html, text/markdown;q=0.5'), false);
  assert.equal(prefersMarkdown(null), false);
});

test('home con Accept: text/markdown devuelve index.md', async () => {
  const res = await handle(req('/', 'text/markdown'), fakeFetch());
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^text\/markdown/);
  assert.equal(res.headers.get('vary'), 'Accept');
  const body = await res.text();
  assert.ok(body.startsWith('# ONLIKE'));
  assert.ok(body.length > 500);
});

test('home con navegador sigue en HTML', async () => {
  assert.equal(await handle(req('/', 'text/html,*/*;q=0.8'), fakeFetch()), undefined);
  assert.equal(await handle(req('/'), fakeFetch()), undefined);
});

test('ruta inexistente con Markdown devuelve 404 en Markdown', async () => {
  const res = await handle(req('/__no-existe', 'text/markdown'), fakeFetch());
  assert.equal(res.status, 404);
  assert.match(res.headers.get('content-type'), /^text\/markdown/);
  const body = await res.text();
  assert.ok(body.length >= 20);
  assert.match(body, /llms\.txt/);
});

test('página existente con Markdown no se intercepta', async () => {
  assert.equal(await handle(req('/notas.html', 'text/markdown'), fakeFetch()), undefined);
});

test('los pedidos internos de sondeo no se procesan', async () => {
  const r = new Request('https://onlike.ar/', { headers: { accept: 'text/markdown', 'x-onlike-md-probe': '1' } });
  assert.equal(await handle(r, fakeFetch()), undefined);
});

test('la home no saltea niveles de encabezado', () => {
  const levels = [...read('index.html').matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  assert.equal(levels.filter((l) => l === 1).length, 1);
  for (let i = 1; i < levels.length; i++) {
    assert.ok(levels[i] - levels[i - 1] <= 1, `salto de h${levels[i - 1]} a h${levels[i]}`);
  }
});

test('vercel.json: redirects de confianza y Vary en la home', () => {
  const cfg = JSON.parse(read('vercel.json'));
  const dest = Object.fromEntries(cfg.redirects.map((r) => [r.source, r.destination]));
  assert.equal(dest['/about'], '/laura-silvester.html');
  assert.equal(dest['/privacy'], '/privacidad.html');
  const home = cfg.headers.find((h) => h.source === '/');
  assert.ok(home.headers.some((h) => h.key === 'Vary' && h.value === 'Accept'));
});

test('llms.txt incluye cuándo usar y cómo contactar', () => {
  const t = read('llms.txt');
  assert.match(t, /^## Cuándo usar ONLIKE \(when to use\)$/m);
  assert.match(t, /^### Cómo derivar una consulta \(how to contact\)$/m);
});
