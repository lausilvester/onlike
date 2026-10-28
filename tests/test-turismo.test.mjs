// Ejecutar con: node --test tests/test-turismo.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import datos from '../test-turismo-datos.js';
import motor from '../test-turismo-motor.js';

const ESTADOS = ['si', 'parcial', 'no', 'sin_revisar'];
const TIPOS = datos.tipos.map((t) => t.id);
const todas = (estado) => Object.fromEntries(datos.preguntas.map((p) => [p.n, estado]));
const con = (base, cambios) => ({ ...base, ...cambios });
const diag = (r, tipo = 'otro') => motor.diagnosticar(datos, r, tipo);
const vacio = (s) => typeof s !== 'string' || s.trim() === '';

test('los datos están completos y son consistentes', () => {
  assert.equal(datos.preguntas.length, 10);
  datos.preguntas.forEach((p, i) => assert.equal(p.n, i + 1));
  assert.deepEqual([...datos.prioridad].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  const enEtapas = datos.etapas.flatMap((e) => e.preguntas).sort((a, b) => a - b);
  assert.deepEqual(enEtapas, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(datos.etapas.map((e) => e.preguntas.length * 2), [6, 6, 8]);
  assert.equal(datos.maximo, 20);
  assert.deepEqual(datos.respuestas.map((r) => [r.id, r.puntos]), [['si', 2], ['parcial', 1], ['no', 0], ['sin_revisar', 0]]);

  for (const tipo of TIPOS) {
    for (const p of datos.preguntas) {
      assert.equal(datos.etapas.find((e) => e.id === p.etapa).preguntas.includes(p.n), true);
      for (const t of [p.pregunta, p.aspecto, motor.texto(p.apoyo, tipo), motor.texto(p.recomendacion.accion, tipo), p.recomendacion.titulo, p.recomendacion.tituloPendiente]) {
        assert.equal(vacio(t), false, `P${p.n} (${tipo}) tiene un texto vacío`);
      }
      assert.match(p.recomendacion.tituloPendiente, /^Comprobá /, `P${p.n}: el título pendiente debe empezar con «Comprobá»`);
      for (const item of p.comprobar) {
        const valor = item && typeof item === 'object' && 'ejemplo' in item ? item.ejemplo : item;
        assert.equal(vacio(motor.texto(valor, tipo)), false, `P${p.n} (${tipo}) tiene un «cómo comprobarlo» vacío`);
      }
    }
  }
});

test('los textos de agencia y gastronomía no hablan de alojamiento', () => {
  const prohibido = /habitaci|booking|check-in|estad[ií]a|ecolodge|\bhotel|alojamiento/i;
  for (const tipo of ['agencia', 'gastronomia']) {
    for (const p of datos.preguntas) {
      const textos = [motor.texto(p.apoyo, tipo), motor.texto(p.recomendacion.accion, tipo), p.recomendacion.titulo];
      for (const item of p.comprobar) {
        textos.push(motor.texto(item && typeof item === 'object' && 'ejemplo' in item ? item.ejemplo : item, tipo));
      }
      for (const t of textos) assert.doesNotMatch(t, prohibido, `P${p.n} (${tipo}): «${t}»`);
    }
  }
});

test('todo en «No»: 0 puntos, lectura baja y las tres prioridades más importantes', () => {
  const d = diag(todas('no'));
  assert.equal(d.total, 0);
  assert.equal(d.lectura.id, 'bajo');
  assert.deepEqual(d.prioridades.map((p) => p.n), [10, 7, 4]);
  assert.ok(d.prioridades.every((p) => p.estado === 'no' && p.etiqueta === datos.estados.no));
  assert.deepEqual(d.etapas.map((e) => [e.puntos, e.max]), [[0, 6], [0, 6], [0, 8]]);
});

test('todo en «Sí»: 20 puntos, sin correcciones', () => {
  const d = diag(todas('si'));
  assert.equal(d.total, 20);
  assert.equal(d.lectura.id, 'alto');
  assert.equal(d.todoResuelto, true);
  assert.deepEqual(d.prioridades, []);
  assert.deepEqual(d.etapas.map((e) => e.puntos), [6, 6, 8]);
  assert.match(motor.aTexto(datos, d, 'Alojamiento', 'https://onlike.ar/test-turismo'), /revisión cada tanto/);
});

test('todo «No lo revisé»: 0 puntos pero nunca se presenta como problema confirmado', () => {
  const d = diag(todas('sin_revisar'));
  assert.equal(d.total, 0);
  assert.equal(d.lectura.id, 'verificacion');
  assert.equal(d.pendientes.length, 10);
  assert.equal(d.prioridades.length, 3);
  for (const p of d.prioridades) {
    assert.equal(p.estado, 'sin_revisar');
    assert.match(p.titulo, /^Comprobá /);
    assert.equal(p.etiqueta, datos.estados.sin_revisar);
  }
  for (const e of d.etapas) {
    assert.doesNotMatch(e.descripcion, /Marcaste como no resuelto/);
    assert.match(e.descripcion, /Todavía no revisaste/);
  }
});

test('umbral de verificación: tres sin revisar no alcanzan, cuatro sí', () => {
  const tres = con(todas('si'), { 1: 'sin_revisar', 2: 'sin_revisar', 3: 'sin_revisar' });
  assert.notEqual(diag(tres).lectura.id, 'verificacion');
  const cuatro = con(tres, { 4: 'sin_revisar' });
  assert.equal(diag(cuatro).lectura.id, 'verificacion');
  assert.equal(diag(cuatro).total, 12);
});

test('límites de los niveles de lectura', () => {
  const conPuntos = (puntos) => {
    // Llena con «Sí» (2) y, si hace falta, un «En parte» (1), el resto en «No».
    const r = todas('no');
    let resto = puntos;
    for (let n = 1; n <= 10 && resto > 0; n++) {
      if (resto >= 2) { r[n] = 'si'; resto -= 2; } else { r[n] = 'parcial'; resto -= 1; }
    }
    return r;
  };
  const esperado = { 0: 'bajo', 7: 'bajo', 8: 'medio', 14: 'medio', 15: 'alto', 20: 'alto' };
  for (const [puntos, id] of Object.entries(esperado)) {
    const d = diag(conPuntos(Number(puntos)));
    assert.equal(d.total, Number(puntos));
    assert.equal(d.lectura.id, id, `${puntos} puntos`);
  }
});

test('lo confirmado no se recomienda y los problemas van antes que lo parcial y lo pendiente', () => {
  const r = {
    1: 'si', 2: 'sin_revisar', 3: 'parcial', 4: 'no',
    5: 'si', 6: 'parcial', 7: 'sin_revisar', 8: 'no', 9: 'si', 10: 'parcial'
  };
  const d = diag(r);
  assert.deepEqual(d.prioridades.map((p) => p.n), [4, 8, 10]);
  assert.deepEqual(d.prioridades.map((p) => p.estado), ['no', 'no', 'parcial']);
});

test('con cuatro o más sin revisar la lista arranca por lo pendiente', () => {
  const r = con(todas('no'), { 2: 'sin_revisar', 3: 'sin_revisar', 5: 'sin_revisar', 6: 'sin_revisar' });
  const d = diag(r);
  assert.equal(d.lectura.id, 'verificacion');
  assert.deepEqual(d.prioridades.map((p) => p.n), [2, 5, 6]);
});

test('mismo puntaje con problemas distintos da recomendaciones distintas', () => {
  const a = con(todas('si'), { 10: 'no', 7: 'no' });
  const b = con(todas('si'), { 1: 'no', 2: 'no' });
  const da = diag(a);
  const db = diag(b);
  assert.equal(da.total, db.total);
  assert.deepEqual(da.prioridades.map((p) => p.n), [10, 7]);
  assert.deepEqual(db.prioridades.map((p) => p.n), [1, 2]);
  assert.notDeepEqual(da.prioridades.map((p) => p.titulo), db.prioridades.map((p) => p.titulo));
});

test('el rubro cambia el texto de la recomendación cuando corresponde', () => {
  const r = con(todas('si'), { 6: 'no' });
  const agencia = diag(r, 'agencia').prioridades[0].accion;
  const alojamiento = diag(r, 'alojamiento').prioridades[0].accion;
  assert.match(agencia, /punto de encuentro/);
  assert.doesNotMatch(alojamiento, /punto de encuentro/);
});

test('rechaza respuestas incompletas o inválidas', () => {
  const incompleta = todas('si');
  delete incompleta[10];
  assert.throws(() => diag(incompleta));
  assert.throws(() => diag(con(todas('si'), { 3: 'tal vez' })));
});

test('las 4^10 combinaciones producen un resultado válido', () => {
  const orden = datos.prioridad;
  const rango = (estado) => ({ no: 0, parcial: 1, sin_revisar: 2 })[estado];
  const total = 4 ** 10;
  const r = {};
  for (let i = 0; i < total; i++) {
    let x = i;
    let puntos = 0;
    let sin = 0;
    let todoSi = true;
    for (let n = 1; n <= 10; n++) {
      const e = ESTADOS[x & 3];
      x >>= 2;
      r[n] = e;
      if (e === 'si') puntos += 2; else { todoSi = false; if (e === 'parcial') puntos += 1; }
      if (e === 'sin_revisar') sin++;
    }
    const d = diag(r, TIPOS[(Math.imul(i, 2654435761) >>> 30) & 3]);

    if (d.total !== puntos || d.conteo.sin_revisar !== sin) assert.fail(`puntaje mal calculado en la combinación ${i}`);
    if (d.etapas.reduce((a, e) => a + e.puntos, 0) !== puntos) assert.fail(`etapas no suman el total en ${i}`);
    if ((d.lectura.id === 'verificacion') !== (sin >= 4)) assert.fail(`lectura de verificación incorrecta en ${i}`);
    if (!d.lectura.titulo || !d.lectura.texto) assert.fail(`lectura vacía en ${i}`);
    if (d.todoResuelto !== todoSi) assert.fail(`todoResuelto incorrecto en ${i}`);
    if (d.pendientes.length !== sin) assert.fail(`pendientes incorrectos en ${i}`);

    const candidatas = 10 - d.conteo.si;
    if (d.prioridades.length !== Math.min(3, candidatas)) assert.fail(`cantidad de prioridades incorrecta en ${i}`);
    const vistas = new Set();
    let anterior = -1;
    for (const p of d.prioridades) {
      if (r[p.n] === 'si') assert.fail(`recomienda algo confirmado en ${i}`);
      if (vistas.has(p.n)) assert.fail(`prioridad repetida en ${i}`);
      vistas.add(p.n);
      if (vacio(p.titulo) || vacio(p.accion) || vacio(p.etiqueta)) assert.fail(`prioridad vacía en ${i}`);
      if (p.estado === 'sin_revisar' && !p.titulo.startsWith('Comprobá ')) assert.fail(`pendiente mal redactado en ${i}`);
      // Orden: por grupo (según el modo) y, dentro del grupo, por importancia.
      const grupo = d.verificacion ? { sin_revisar: 0, no: 1, parcial: 2 }[p.estado] : rango(p.estado);
      const clave = grupo * 100 + orden.indexOf(p.n);
      if (clave <= anterior) assert.fail(`prioridades desordenadas en ${i}`);
      anterior = clave;
    }
    for (const e of d.etapas) {
      if (vacio(e.descripcion)) assert.fail(`descripción de etapa vacía en ${i}`);
      if (e.conteo.sin_revisar > 0 && e.conteo.sin_revisar < e.max / 2 && /no revisaste ninguno/.test(e.descripcion)) assert.fail(`descripción de etapa incorrecta en ${i}`);
    }
  }
});
