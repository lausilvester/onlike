// Ejecutar con: node --test tests/aviso-test-turismo.test.mjs
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const aviso = require('../api/test-turismo-aviso.js');

const ENV = { RESEND_API_KEY: 're_clave_de_prueba', AVISO_EMAIL_PARA: 'yo@ejemplo.com' };

function respuesta() {
  const r = { codigo: null, cabeceras: {} };
  r.setHeader = (k, v) => { r.cabeceras[k] = v; };
  r.status = (c) => { r.codigo = c; return r; };
  r.end = () => r;
  return r;
}
const pedido = (extra = {}) => ({
  method: 'POST',
  headers: { origin: 'https://onlike.ar' },
  body: { evento: 'fin', tipo: 'agencia' },
  ...extra
});
function conEnvio() {
  const llamadas = [];
  const enviar = async (url, init) => { llamadas.push({ url, init }); return { ok: true }; };
  return { llamadas, enviar };
}

beforeEach(() => aviso.reiniciarFreno());

test('manda el aviso con el rubro y sin respuestas ni puntaje', async () => {
  const { llamadas, enviar } = conEnvio();
  const res = respuesta();
  await aviso.handler(pedido(), res, { env: ENV, enviar, ahora: () => Date.UTC(2026, 9, 28, 23, 0) });
  assert.equal(res.codigo, 204);
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].url, 'https://api.resend.com/emails');
  assert.equal(llamadas[0].init.headers.Authorization, 'Bearer re_clave_de_prueba');
  const mail = JSON.parse(llamadas[0].init.body);
  assert.deepEqual(mail.to, ['yo@ejemplo.com']);
  assert.equal(mail.subject, 'Alguien terminó el Test Turismo');
  assert.match(mail.text, /Agencia, excursiones o experiencias/);
  assert.match(mail.text, /28 de octubre de 2026.*20:00/);
  assert.doesNotMatch(mail.text, /puntaje: \d|respuesta: /i);
});

test('solo acepta POST', async () => {
  const { llamadas, enviar } = conEnvio();
  const res = respuesta();
  await aviso.handler(pedido({ method: 'GET' }), res, { env: ENV, enviar });
  assert.equal(res.codigo, 405);
  assert.equal(res.cabeceras.Allow, 'POST');
  assert.equal(llamadas.length, 0);
});

test('rechaza pedidos de otros sitios y acepta onlike.ar y los previews de Vercel', async () => {
  const { llamadas, enviar } = conEnvio();
  for (const origin of ['https://otro-sitio.com', undefined, 'http://onlike.ar']) {
    const res = respuesta();
    await aviso.handler(pedido({ headers: origin ? { origin } : {} }), res, { env: ENV, enviar });
    assert.equal(res.codigo, 403, String(origin));
  }
  assert.equal(llamadas.length, 0);
  for (const origin of ['https://www.onlike.ar', 'https://onlike-git-test-turismo-laura.vercel.app']) {
    aviso.reiniciarFreno();
    const res = respuesta();
    await aviso.handler(pedido({ headers: { origin } }), res, { env: ENV, enviar });
    assert.equal(res.codigo, 204, origin);
  }
  assert.equal(llamadas.length, 2);
});

test('rechaza cuerpos inválidos o con datos de más', async () => {
  const { llamadas, enviar } = conEnvio();
  for (const body of [{}, { evento: 'inicio', tipo: 'otro' }, { evento: 'fin', tipo: 'hotel' }, { evento: 'fin' }, { evento: 'fin', tipo: '__proto__' }, 'no es json']) {
    const res = respuesta();
    await aviso.handler(pedido({ body }), res, { env: ENV, enviar });
    assert.equal(res.codigo, 400, JSON.stringify(body));
  }
  assert.equal(llamadas.length, 0);
});

test('acepta el cuerpo como texto JSON', async () => {
  const { llamadas, enviar } = conEnvio();
  const res = respuesta();
  await aviso.handler(pedido({ body: JSON.stringify({ evento: 'fin', tipo: 'otro' }) }), res, { env: ENV, enviar });
  assert.equal(res.codigo, 204);
  assert.equal(llamadas.length, 1);
});

test('sin variables de entorno no hace nada y no falla', async () => {
  const { llamadas, enviar } = conEnvio();
  for (const env of [{}, { RESEND_API_KEY: 'x' }, { AVISO_EMAIL_PARA: 'yo@ejemplo.com' }]) {
    const res = respuesta();
    await aviso.handler(pedido(), res, { env, enviar });
    assert.equal(res.codigo, 204);
  }
  assert.equal(llamadas.length, 0);
});

test('frena los avisos seguidos y el exceso por hora', async () => {
  const { llamadas, enviar } = conEnvio();
  let t = 1_000_000;
  const hacer = async () => { await aviso.handler(pedido(), respuesta(), { env: ENV, enviar, ahora: () => t }); };
  await hacer();
  t += 5_000; await hacer();           // dentro de la pausa: no sale
  assert.equal(llamadas.length, 1);
  for (let i = 0; i < 40; i++) { t += 16_000; await hacer(); }
  assert.ok(llamadas.length <= 20, `salieron ${llamadas.length} en menos de una hora`);
  t += 60 * 60 * 1000; await hacer();  // pasó la hora: vuelve a salir
  assert.ok(llamadas.length > 20 - 1);
});

test('si Resend falla, igual responde 204', async () => {
  const res = respuesta();
  await aviso.handler(pedido(), res, { env: ENV, enviar: async () => { throw new Error('sin red'); } });
  assert.equal(res.codigo, 204);
});

test('el cuerpo que manda la página no lleva respuestas ni puntaje', async () => {
  const { readFileSync } = await import('node:fs');
  const ui = readFileSync(new URL('../test-turismo.js', import.meta.url), 'utf8');
  const bloque = ui.slice(ui.indexOf('function avisar'), ui.indexOf('function pintarResultado'));
  assert.match(bloque, /evento: 'fin'/);
  assert.match(bloque, /tipo: estado\.tipo/);
  assert.doesNotMatch(bloque, /respuestas|total|puntos/);
});
