// Aviso por email cuando alguien termina el Test Turismo.
// Recibe solo { evento: 'fin', tipo } (el rubro elegido). No recibe ni guarda respuestas,
// puntaje ni datos de la persona. Si faltan las variables de entorno, no hace nada.
//
// Variables en Vercel (Settings > Environment Variables):
//   RESEND_API_KEY     clave de la cuenta de Resend
//   AVISO_EMAIL_PARA   mail donde llega el aviso (con el remitente de prueba de Resend,
//                      tiene que ser el mismo mail con el que se creó la cuenta)
//   AVISO_EMAIL_DE     opcional: remitente propio, cuando el dominio esté verificado en Resend

const RUBROS = {
  alojamiento: 'Alojamiento',
  agencia: 'Agencia receptiva, excursiones o experiencias',
  gastronomia: 'Gastronomía turística',
  otro: 'Otro servicio turístico'
};

const ORIGENES = ['https://onlike.ar', 'https://www.onlike.ar'];
const ES_PREVIEW = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

// Freno básico por instancia: una pausa entre avisos y un tope por hora.
const PAUSA_MS = 15 * 1000;
const MAX_POR_HORA = 20;
const enviados = [];

function origenPermitido(origen) {
  return ORIGENES.indexOf(origen) !== -1 || ES_PREVIEW.test(origen || '');
}

function leerCuerpo(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  try { return JSON.parse(b || '{}'); } catch (e) { return {}; }
}

function fechaLegible(ms) {
  return new Date(ms).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
  });
}

async function handler(req, res, deps) {
  const { env, enviar, ahora } = Object.assign({ env: process.env, enviar: fetch, ahora: Date.now }, deps);
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  if (!origenPermitido(req.headers && req.headers.origin)) return res.status(403).end();

  const cuerpo = leerCuerpo(req);
  if (cuerpo.evento !== 'fin' || !Object.prototype.hasOwnProperty.call(RUBROS, cuerpo.tipo)) {
    return res.status(400).end();
  }

  // Sin configurar, o frenado: se responde igual para no dar pistas ni romper el test.
  if (!env.RESEND_API_KEY || !env.AVISO_EMAIL_PARA) return res.status(204).end();
  const t = ahora();
  while (enviados.length && t - enviados[0] > 60 * 60 * 1000) enviados.shift();
  if (enviados.length >= MAX_POR_HORA || (enviados.length && t - enviados[enviados.length - 1] < PAUSA_MS)) {
    return res.status(204).end();
  }
  enviados.push(t);

  try {
    await enviar('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.AVISO_EMAIL_DE || 'ONLIKE avisos <onboarding@resend.dev>',
        to: [env.AVISO_EMAIL_PARA],
        subject: 'Alguien terminó el Test Turismo',
        text: [
          'Alguien terminó el Test Turismo en onlike.ar.',
          '',
          'Rubro que eligió: ' + RUBROS[cuerpo.tipo],
          'Fecha: ' + fechaLegible(t),
          '',
          'Este aviso no incluye respuestas ni datos de la persona.'
        ].join('\n')
      })
    });
  } catch (e) { /* el aviso es opcional: si falla, el test sigue igual */ }
  return res.status(204).end();
}

module.exports = (req, res) => handler(req, res);
module.exports.handler = handler;
module.exports.reiniciarFreno = () => { enviados.length = 0; };
