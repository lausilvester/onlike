/*
  Test Turismo · interfaz.
  Una pregunta por pantalla, historial del navegador, resultado, copiar y PDF.
  Todo ocurre en el navegador: no se envían respuestas a ningún servidor.
  Mide solo tres eventos en dataLayer: inicio, finalización y clic al servicio.
*/
(function () {
  'use strict';

  var D = window.TEST_TURISMO_DATOS;
  var M = window.TEST_TURISMO_MOTOR;
  if (!D || !M) return;

  var URL_TEST = 'https://onlike.ar/test-turismo';
  var CLAVE = 'testTurismo.v1';
  var TOTAL = D.preguntas.length;
  var reducido = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var estado = { paso: 'intro', indice: 1, tipo: null, respuestas: {}, inicio: false, fin: false };
  var temporizador = null;
  var tituloOriginal = document.title;

  function $(id) { return document.getElementById(id); }

  function crear(etiqueta, clase, texto) {
    var el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function mayuscula(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function medir(evento) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: evento });
  }

  /* ---------- almacenamiento de la sesión (solo en este navegador) ---------- */

  function guardar() {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify({
        tipo: estado.tipo, respuestas: estado.respuestas, inicio: estado.inicio, fin: estado.fin
      }));
    } catch (e) { /* sin almacenamiento: el test funciona igual */ }
  }

  function restaurar() {
    try {
      var crudo = sessionStorage.getItem(CLAVE);
      if (!crudo) return;
      var s = JSON.parse(crudo);
      var tipos = D.tipos.map(function (t) { return t.id; });
      var validas = D.respuestas.map(function (r) { return r.id; });
      if (tipos.indexOf(s.tipo) !== -1) estado.tipo = s.tipo;
      for (var n = 1; n <= TOTAL; n++) {
        if (s.respuestas && validas.indexOf(s.respuestas[n]) !== -1) estado.respuestas[n] = s.respuestas[n];
      }
      estado.inicio = !!s.inicio;
      estado.fin = !!s.fin;
    } catch (e) { /* datos ilegibles: se empieza de cero */ }
  }

  function olvidar() {
    try { sessionStorage.removeItem(CLAVE); } catch (e) { /* nada */ }
  }

  /* ---------- rutas: #tipo, #pregunta-3, #resultado ---------- */

  function hashDe(destino) {
    if (destino.paso === 'tipo') return '#tipo';
    if (destino.paso === 'pregunta') return '#pregunta-' + destino.indice;
    if (destino.paso === 'resultado') return '#resultado';
    return '';
  }

  function destinoDeHash() {
    var h = window.location.hash;
    var m = /^#pregunta-(\d+)$/.exec(h);
    if (m) return { paso: 'pregunta', indice: parseInt(m[1], 10) };
    if (h === '#tipo') return { paso: 'tipo', indice: 1 };
    if (h === '#resultado') return { paso: 'resultado', indice: TOTAL };
    return { paso: 'intro', indice: 1 };
  }

  function primeraSinResponder() {
    for (var n = 1; n <= TOTAL; n++) if (!estado.respuestas[n]) return n;
    return 0;
  }

  // Nadie salta pasos escribiendo la URL: se lo lleva a lo primero que falta.
  function normalizar(d) {
    if (d.paso === 'intro') return d;
    if (!estado.tipo) return { paso: d.paso === 'tipo' ? 'tipo' : 'intro', indice: 1 };
    if (d.paso === 'tipo') return d;
    if (d.paso === 'pregunta') {
      var i = Math.min(Math.max(d.indice, 1), TOTAL);
      return { paso: 'pregunta', indice: i };
    }
    var falta = primeraSinResponder();
    return falta ? { paso: 'pregunta', indice: falta } : { paso: 'resultado', indice: TOTAL };
  }

  /* ---------- pantallas ---------- */

  var PANTALLAS = {
    intro: 'pantalla-intro', tipo: 'pantalla-tipo', pregunta: 'pantalla-pregunta', resultado: 'pantalla-resultado'
  };

  function nombreTipo() {
    for (var i = 0; i < D.tipos.length; i++) if (D.tipos[i].id === estado.tipo) return D.tipos[i].nombre;
    return '';
  }

  function nombreEtapa(id) {
    for (var i = 0; i < D.etapas.length; i++) if (D.etapas[i].id === id) return D.etapas[i].nombre;
    return '';
  }

  function pintarTipo() {
    var botones = $('tipo-opciones').children;
    for (var i = 0; i < botones.length; i++) {
      botones[i].setAttribute('aria-pressed', String(botones[i].getAttribute('data-id') === estado.tipo));
    }
    $('btn-empezar').setAttribute('aria-disabled', estado.tipo ? 'false' : 'true');
    $('tipo-aviso').textContent = '';
  }

  function pintarRespuestas() {
    var actual = estado.respuestas[estado.indice];
    var botones = $('p-opciones').children;
    for (var i = 0; i < botones.length; i++) {
      botones[i].setAttribute('aria-pressed', String(botones[i].getAttribute('data-id') === actual));
    }
    var sig = $('p-siguiente');
    if (actual) {
      sig.hidden = false;
      sig.textContent = estado.indice < TOTAL ? 'Siguiente pregunta' : 'Ver resultado';
    } else {
      sig.hidden = true;
    }
  }

  function pintarPregunta() {
    var q = D.preguntas[estado.indice - 1];
    var tipo = estado.tipo;
    $('p-contador').textContent = 'Pregunta ' + estado.indice + ' de ' + TOTAL;
    $('p-etapa').textContent = nombreEtapa(q.etapa);
    $('p-titulo').textContent = q.pregunta;
    $('p-apoyo').textContent = M.texto(q.apoyo, tipo);
    $('p-volver').textContent = estado.indice === 1 ? 'Volver al tipo de negocio' : 'Volver a la pregunta anterior';

    var ayuda = $('p-ayuda');
    ayuda.hidden = true;
    ayuda.textContent = '';
    $('p-ayuda-btn').setAttribute('aria-expanded', 'false');
    q.comprobar.forEach(function (item) {
      var p = crear('p');
      if (item && typeof item === 'object' && 'ejemplo' in item) {
        var ej = M.texto(item.ejemplo, tipo);
        p.appendChild(crear('strong', '', 'Ejemplo: '));
        p.appendChild(document.createTextNode(/[.?!]$/.test(ej) ? ej : ej + '.'));
      } else if (item && typeof item === 'object' && item.enlace) {
        // Se abre en otra pestaña para no perder el lugar del test.
        var a = crear('a', '', item.enlace.texto);
        a.href = item.enlace.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        p.appendChild(document.createTextNode(item.enlace.antes));
        p.appendChild(a);
        p.appendChild(document.createTextNode(item.enlace.despues || ''));
      } else {
        p.textContent = M.texto(item, tipo);
      }
      ayuda.appendChild(p);
    });
    pintarRespuestas();
  }

  function pintarResultado() {
    var diag = M.diagnosticar(D, estado.respuestas, estado.tipo);

    $('r-total').textContent = diag.total;
    $('r-max').textContent = '/' + diag.max;
    $('r-numero').setAttribute('aria-label', 'Tu diagnóstico: ' + diag.total + ' de ' + diag.max);
    $('r-titulo').textContent = diag.lectura.titulo + '.';
    $('r-texto').textContent = diag.lectura.texto;
    $('imp-tipo').textContent = 'Tipo de negocio: ' + nombreTipo();

    var etapas = $('r-etapas');
    etapas.textContent = '';
    diag.etapas.forEach(function (e) {
      var li = crear('li', 'etapa');
      var cabeza = crear('div', 'etapa-cabeza');
      cabeza.appendChild(crear('h3', '', e.nombre));
      var puntos = crear('p', 'etapa-puntos', String(e.puntos));
      puntos.appendChild(crear('small', '', '/' + e.max));
      cabeza.appendChild(puntos);
      li.appendChild(cabeza);
      var barra = crear('div', 'barra');
      barra.setAttribute('aria-hidden', 'true');
      var relleno = document.createElement('span');
      relleno.style.width = Math.round((e.puntos / e.max) * 100) + '%';
      barra.appendChild(relleno);
      li.appendChild(barra);
      li.appendChild(crear('p', '', e.descripcion));
      etapas.appendChild(li);
    });

    var pend = $('r-pendientes');
    var listaPend = $('r-pendientes-lista');
    listaPend.textContent = '';
    pend.hidden = diag.pendientes.length === 0;
    diag.pendientes.forEach(function (p) {
      listaPend.appendChild(crear('li', '', mayuscula(p.aspecto)));
    });

    var prios = $('r-prios');
    prios.textContent = '';
    prios.hidden = diag.prioridades.length === 0;
    diag.prioridades.forEach(function (p, i) {
      var li = crear('li', 'prio');
      var n = crear('span', 'prio-n', String(i + 1));
      n.setAttribute('aria-hidden', 'true');
      li.appendChild(n);
      var cuerpo = document.createElement('div');
      cuerpo.appendChild(crear('p', 'prio-estado', p.etiqueta));
      cuerpo.appendChild(crear('h3', '', p.titulo));
      cuerpo.appendChild(crear('p', '', p.accion));
      li.appendChild(cuerpo);
      prios.appendChild(li);
    });
    var todo = $('r-todo-resuelto');
    todo.hidden = diag.prioridades.length !== 0;
    if (!todo.hidden) {
      $('r-todo-titulo').textContent = D.lecturas.todoResuelto.titulo;
      $('r-todo-texto').textContent = D.lecturas.todoResuelto.texto;
    }

    $('estado-copia').textContent = '';
    if (!estado.fin) {
      estado.fin = true;
      guardar();
      medir('test_turismo_fin');
    }
    return diag;
  }

  function mostrar(destino, modo) {
    modo = modo || {};
    if (temporizador) { clearTimeout(temporizador); temporizador = null; }
    destino = normalizar(destino);

    var cambioDePantalla = estado.paso !== destino.paso;
    estado.paso = destino.paso;
    estado.indice = destino.indice;

    Object.keys(PANTALLAS).forEach(function (p) { $(PANTALLAS[p]).hidden = p !== destino.paso; });
    document.body.classList.toggle('en-pregunta', destino.paso === 'pregunta');

    var barra = $('progreso');
    var conBarra = destino.paso === 'pregunta' || destino.paso === 'resultado';
    barra.hidden = !conBarra;
    var avance = destino.paso === 'resultado' ? TOTAL : destino.indice;
    barra.setAttribute('aria-valuenow', conBarra ? String(avance) : '0');
    $('progreso-relleno').style.width = (conBarra ? (avance / TOTAL) * 100 : 0) + '%';

    var titulo;
    if (destino.paso === 'tipo') { pintarTipo(); titulo = $('tipo-titulo'); }
    else if (destino.paso === 'pregunta') { pintarPregunta(); titulo = $('p-titulo'); }
    else if (destino.paso === 'resultado') { pintarResultado(); titulo = $('r-titulo'); }
    else { titulo = $('intro-titulo'); }

    if (!modo.sinHistorial) {
      var url = window.location.pathname + window.location.search + hashDe(destino);
      try {
        if (modo.empujar) window.history.pushState(null, '', url);
        else window.history.replaceState(null, '', url);
      } catch (e) { /* sin historial: sigue funcionando */ }
    }

    // Entre preguntas no se mueve la pantalla; al cambiar de pantalla se vuelve arriba.
    if (!modo.inicial) {
      if (cambioDePantalla) {
        window.scrollTo(0, 0);
      } else if (titulo.getBoundingClientRect().top < 0) {
        titulo.scrollIntoView({ block: 'start' });
      }
      titulo.focus({ preventScroll: true });
    }
  }

  /* ---------- acciones ---------- */

  function avanzar() {
    if (estado.indice < TOTAL) mostrar({ paso: 'pregunta', indice: estado.indice + 1 }, { empujar: true });
    else mostrar({ paso: 'resultado', indice: TOTAL }, { empujar: true });
  }

  function retroceder() {
    if (estado.indice > 1) mostrar({ paso: 'pregunta', indice: estado.indice - 1 }, { empujar: true });
    else mostrar({ paso: 'tipo', indice: 1 }, { empujar: true });
  }

  function responder(id) {
    estado.respuestas[estado.indice] = id;
    guardar();
    pintarRespuestas();
    if (temporizador) clearTimeout(temporizador);
    // Una pausa corta deja ver qué se eligió antes de pasar a la siguiente.
    temporizador = setTimeout(function () { temporizador = null; avanzar(); }, reducido ? 0 : 220);
  }

  function elegirTipo(id) {
    estado.tipo = id;
    guardar();
    pintarTipo();
  }

  function empezar() {
    if (!estado.tipo) {
      $('tipo-aviso').textContent = 'Elegí una opción para empezar.';
      $('tipo-opciones').firstChild.focus();
      return;
    }
    if (!estado.inicio) {
      estado.inicio = true;
      guardar();
      medir('test_turismo_inicio');
    }
    mostrar({ paso: 'pregunta', indice: 1 }, { empujar: true });
  }

  function reiniciar() {
    estado.tipo = null;
    estado.respuestas = {};
    estado.inicio = false;
    estado.fin = false;
    olvidar();
    mostrar({ paso: 'intro', indice: 1 }, { empujar: true });
  }

  function avisoCopia(texto) {
    var el = $('estado-copia');
    el.textContent = texto;
    setTimeout(function () { if (el.textContent === texto) el.textContent = ''; }, 5000);
  }

  function copiarConRespaldo(texto) {
    var area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  function copiarTexto(texto, mensajeOk, mensajeError) {
    var listo = function () { avisoCopia(mensajeOk); };
    var falla = function () {
      if (copiarConRespaldo(texto)) listo();
      else avisoCopia(mensajeError);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(listo, falla);
    else falla();
  }

  function copiar() {
    var diag = M.diagnosticar(D, estado.respuestas, estado.tipo);
    copiarTexto(
      M.aTexto(D, diag, nombreTipo(), URL_TEST),
      'Diagnóstico copiado.',
      'No se pudo copiar. Usá «Guardar como PDF» para conservar el diagnóstico.'
    );
  }

  // Se comparte el test, nunca el resultado de la persona.
  function copiarEnlace() {
    copiarTexto(URL_TEST, 'Enlace copiado: ' + URL_TEST, 'No se pudo copiar. El enlace es ' + URL_TEST);
  }

  function guardarPdf() {
    document.title = 'Test Turismo de ONLIKE - Diagnóstico';
    var restaurarTitulo = function () { document.title = tituloOriginal; };
    window.addEventListener('afterprint', restaurarTitulo, { once: true });
    window.print();
  }

  /* ---------- armado inicial ---------- */

  function armarOpciones(contenedor, items, alElegir, aparte) {
    items.forEach(function (it, i) {
      var b = crear('button', 'op' + (aparte && i === items.length - 1 ? ' op--aparte' : ''), it.nombre);
      b.type = 'button';
      b.setAttribute('data-id', it.id);
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { alElegir(it.id); });
      contenedor.appendChild(b);
    });
  }

  function iniciar() {
    armarOpciones($('tipo-opciones'), D.tipos, elegirTipo, false);
    armarOpciones($('p-opciones'), D.respuestas, responder, true);

    $('btn-revisar').addEventListener('click', function () { mostrar({ paso: 'tipo', indice: 1 }, { empujar: true }); });
    $('btn-empezar').addEventListener('click', empezar);
    $('tipo-volver').addEventListener('click', function () { mostrar({ paso: 'intro', indice: 1 }, { empujar: true }); });
    $('p-volver').addEventListener('click', retroceder);
    $('p-siguiente').addEventListener('click', avanzar);
    $('p-ayuda-btn').addEventListener('click', function () {
      var abierta = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!abierta));
      $('p-ayuda').hidden = abierta;
    });
    $('btn-copiar').addEventListener('click', copiar);
    $('btn-pdf').addEventListener('click', guardarPdf);
    $('btn-enlace').addEventListener('click', copiarEnlace);
    $('btn-reiniciar').addEventListener('click', reiniciar);
    $('r-servicio').addEventListener('click', function () { medir('test_turismo_servicio'); });

    window.addEventListener('popstate', function () {
      mostrar(destinoDeHash(), { sinHistorial: true });
    });

    restaurar();
    mostrar(destinoDeHash(), { inicial: true });
  }

  /* ---------- menú y medición de WhatsApp, como en el resto del sitio ---------- */

  var toggle = $('nav-toggle');
  var navLinks = $('nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var abierto = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!abierto));
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
  window.addEventListener('scroll', function () {
    document.querySelector('header nav').style.boxShadow = window.scrollY > 20 ? '0 2px 20px rgba(0,0,0,0.25)' : 'none';
  }, { passive: true });

  document.querySelectorAll('.js-wa').forEach(function (el) {
    el.addEventListener('click', function () {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'click_whatsapp', wa_origen: el.getAttribute('data-wa') });
    });
  });

  iniciar();
})();
