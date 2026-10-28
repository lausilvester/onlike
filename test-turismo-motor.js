/*
  Test Turismo · motor.
  Recibe las diez respuestas y devuelve el diagnóstico. No toca el DOM.
  Las reglas (orden de prioridad, umbrales, textos) están en test-turismo-datos.js.
*/
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TEST_TURISMO_MOTOR = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CLAVES = ['si', 'parcial', 'no', 'sin_revisar'];

  // Resuelve un texto con variantes por rubro.
  function texto(valor, tipo) {
    if (valor && typeof valor === 'object') {
      return valor[tipo] !== undefined ? valor[tipo] : valor.base;
    }
    return valor;
  }

  function unir(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' y ' + items[items.length - 1];
  }

  function conteoVacio() {
    return { si: 0, parcial: 0, no: 0, sin_revisar: 0 };
  }

  function puntosDe(datos, id) {
    for (var i = 0; i < datos.respuestas.length; i++) {
      if (datos.respuestas[i].id === id) return datos.respuestas[i].puntos;
    }
    throw new Error('Respuesta desconocida: ' + id);
  }

  function preguntaDe(datos, n) {
    return datos.preguntas[n - 1];
  }

  // Descripción breve de cada etapa, armada con lo que respondió la persona.
  // Atribuye los problemas a lo que marcó el usuario; nunca afirma cómo se ve el negocio desde afuera.
  function describirEtapa(datos, etapa, respuestas, conteo) {
    var n = etapa.preguntas.length;
    if (conteo.sin_revisar === n) {
      return 'Todavía no revisaste ninguno de estos aspectos. Sin comprobarlos no se puede leer esta etapa.';
    }
    if (conteo.si === n) {
      return 'Confirmaste los ' + n + ' aspectos de esta etapa.';
    }
    var por = { si: [], parcial: [], no: [], sin_revisar: [] };
    etapa.preguntas.forEach(function (q) {
      por[respuestas[q]].push(preguntaDe(datos, q).aspecto);
    });
    var partes = [];
    if (por.si.length) partes.push('Confirmaste ' + unir(por.si) + '.');
    if (por.parcial.length) partes.push('Está en parte resuelto: ' + unir(por.parcial) + '.');
    if (por.no.length) partes.push('Marcaste como no resuelto: ' + unir(por.no) + '.');
    if (por.sin_revisar.length) partes.push('Falta comprobar: ' + unir(por.sin_revisar) + '.');
    return partes.join(' ');
  }

  function elegirLectura(datos, total, sinRevisar) {
    if (sinRevisar >= datos.umbralSinRevisar) {
      return { id: 'verificacion', titulo: datos.lecturas.verificacion.titulo, texto: datos.lecturas.verificacion.texto };
    }
    var niveles = datos.lecturas.niveles;
    for (var i = 0; i < niveles.length; i++) {
      if (total <= niveles[i].hasta) {
        return { id: niveles[i].id, titulo: niveles[i].titulo, texto: niveles[i].texto };
      }
    }
    var ultimo = niveles[niveles.length - 1];
    return { id: ultimo.id, titulo: ultimo.titulo, texto: ultimo.texto };
  }

  // Hasta tres recomendaciones.
  // Orden: problemas confirmados, después lo resuelto en parte, después lo pendiente de comprobar.
  // Con cuatro o más «No lo revisé», la lista arranca por lo pendiente.
  // Dentro de cada grupo manda el orden de importancia comercial de datos.prioridad.
  // Lo que la persona confirmó nunca entra.
  function elegirPrioridades(datos, respuestas, tipo, verificacion) {
    var grupos = verificacion ? ['sin_revisar', 'no', 'parcial'] : ['no', 'parcial', 'sin_revisar'];
    var elegidas = [];
    grupos.forEach(function (estado) {
      datos.prioridad.forEach(function (n) {
        if (elegidas.length >= 3 || respuestas[n] !== estado) return;
        var rec = preguntaDe(datos, n).recomendacion;
        elegidas.push({
          n: n,
          estado: estado,
          etiqueta: datos.estados[estado],
          titulo: estado === 'sin_revisar' ? rec.tituloPendiente : rec.titulo,
          accion: texto(rec.accion, tipo)
        });
      });
    });
    return elegidas;
  }

  function validar(datos, respuestas) {
    for (var n = 1; n <= datos.preguntas.length; n++) {
      if (CLAVES.indexOf(respuestas[n]) === -1) return false;
    }
    return true;
  }

  // respuestas: { 1: 'si' | 'parcial' | 'no' | 'sin_revisar', … 10: … }
  function diagnosticar(datos, respuestas, tipo) {
    if (!validar(datos, respuestas)) {
      throw new Error('Faltan respuestas válidas para las ' + datos.preguntas.length + ' preguntas.');
    }
    var conteo = conteoVacio();
    var total = 0;
    var etapas = datos.etapas.map(function (etapa) {
      var c = conteoVacio();
      var puntos = 0;
      etapa.preguntas.forEach(function (q) {
        var r = respuestas[q];
        c[r]++;
        conteo[r]++;
        puntos += puntosDe(datos, r);
      });
      total += puntos;
      return {
        id: etapa.id,
        nombre: etapa.nombre,
        puntos: puntos,
        max: etapa.preguntas.length * 2,
        conteo: c,
        descripcion: describirEtapa(datos, etapa, respuestas, c)
      };
    });

    var verificacion = conteo.sin_revisar >= datos.umbralSinRevisar;
    var todoResuelto = conteo.si === datos.preguntas.length;

    var pendientes = [];
    for (var n = 1; n <= datos.preguntas.length; n++) {
      if (respuestas[n] === 'sin_revisar') {
        pendientes.push({ n: n, aspecto: preguntaDe(datos, n).aspecto });
      }
    }

    return {
      tipo: tipo,
      total: total,
      max: datos.maximo,
      conteo: conteo,
      verificacion: verificacion,
      todoResuelto: todoResuelto,
      lectura: elegirLectura(datos, total, conteo.sin_revisar),
      etapas: etapas,
      pendientes: pendientes,
      prioridades: elegirPrioridades(datos, respuestas, tipo, verificacion)
    };
  }

  // Texto plano para «Copiar mi diagnóstico».
  function aTexto(datos, diag, nombreTipo, url) {
    var l = [];
    l.push('Test Turismo de ONLIKE');
    if (nombreTipo) l.push('Tipo de negocio: ' + nombreTipo);
    l.push('');
    l.push('Tu diagnóstico: ' + diag.total + '/' + diag.max);
    l.push(diag.lectura.titulo + '.');
    l.push(diag.lectura.texto);
    l.push('Este puntaje refleja lo que pudiste confirmar sobre la información de tu negocio. No mide tu posición en Google ni garantiza recomendaciones de inteligencias artificiales.');
    l.push('');
    l.push('Por etapa');
    diag.etapas.forEach(function (e) {
      l.push('- ' + e.nombre + ': ' + e.puntos + '/' + e.max);
      l.push('  ' + e.descripcion);
    });
    if (diag.pendientes.length) {
      l.push('');
      l.push('Pendientes de comprobación (' + diag.pendientes.length + ')');
      diag.pendientes.forEach(function (p) { l.push('- ' + p.aspecto.charAt(0).toUpperCase() + p.aspecto.slice(1)); });
    }
    l.push('');
    if (diag.prioridades.length) {
      l.push('Por dónde empezaría');
      l.push('Según lo que respondiste, esto es lo que conviene revisar primero.');
      diag.prioridades.forEach(function (p, i) {
        l.push((i + 1) + '. ' + p.titulo + ' (' + p.etiqueta.charAt(0).toLowerCase() + p.etiqueta.slice(1) + ')');
        l.push('   ' + p.accion);
      });
    } else {
      l.push(datos.lecturas.todoResuelto.titulo + ' ' + datos.lecturas.todoResuelto.texto);
    }
    if (url) {
      l.push('');
      l.push(url);
    }
    return l.join('\n');
  }

  return {
    texto: texto,
    diagnosticar: diagnosticar,
    aTexto: aTexto
  };
});
