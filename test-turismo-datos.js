/*
  Test Turismo · datos.
  Preguntas, rubros, niveles de lectura y catálogo de recomendaciones.
  Acá se edita el contenido; el cálculo vive en test-turismo-motor.js y la
  interfaz en test-turismo.js.

  Un texto puede ser un string o un objeto con variantes por rubro:
    { base: '…', alojamiento: '…', agencia: '…', gastronomia: '…', otro: '…' }
  Si falta la variante del rubro elegido, se usa "base".
  En "comprobar", un ítem { ejemplo: <texto> } se muestra como «Ejemplo: …».

  Si cambian las preguntas, actualizar también el bloque <noscript> de
  test-turismo.html y la lista en llms.txt.
*/
(function (root, factory) {
  var datos = factory();
  if (typeof module === 'object' && module.exports) module.exports = datos;
  else root.TEST_TURISMO_DATOS = datos;
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    version: 1,
    maximo: 20,

    tipos: [
      { id: 'alojamiento', nombre: 'Alojamiento' },
      { id: 'agencia', nombre: 'Agencia, excursiones o experiencias' },
      { id: 'gastronomia', nombre: 'Gastronomía turística' },
      { id: 'otro', nombre: 'Otro servicio turístico' }
    ],

    respuestas: [
      { id: 'si', nombre: 'Sí, lo comprobé', puntos: 2 },
      { id: 'parcial', nombre: 'En parte', puntos: 1 },
      { id: 'no', nombre: 'No', puntos: 0 },
      { id: 'sin_revisar', nombre: 'No lo revisé', puntos: 0 }
    ],

    etapas: [
      { id: 'encuentren', nombre: 'Que te encuentren', preguntas: [1, 2, 3] },
      { id: 'entiendan', nombre: 'Que te entiendan', preguntas: [4, 5, 6] },
      { id: 'elijan', nombre: 'Que te elijan', preguntas: [7, 8, 9, 10] }
    ],

    // Orden orientativo de importancia comercial para desempatar prioridades.
    prioridad: [10, 7, 4, 8, 1, 2, 5, 6, 9, 3],

    // Con esta cantidad (o más) de «No lo revisé» la lectura pasa a verificación.
    umbralSinRevisar: 4,

    lecturas: {
      verificacion: {
        titulo: 'Todavía hay información que necesitás comprobar',
        texto: 'El resultado muestra qué aspectos conocés de tu presencia digital y cuáles todavía no evaluaste. Empezá por estos últimos antes de sacar conclusiones.'
      },
      niveles: [
        {
          id: 'bajo', hasta: 7,
          titulo: 'Hay información importante que necesitás revisar',
          texto: 'Tus respuestas muestran varios aspectos sin resolver. La prioridad es identificar cuáles afectan la forma en que un viajero encuentra y evalúa tu propuesta.'
        },
        {
          id: 'medio', hasta: 14,
          titulo: 'Tenés una base. Hay piezas que todavía no están conectadas',
          texto: 'Algunos aspectos funcionan, pero quedan diferencias, información incompleta o pasos que pueden dificultar la decisión del viajero.'
        },
        {
          id: 'alto', hasta: 20,
          titulo: 'Tu información tiene una base bastante trabajada',
          texto: 'Confirmaste varios aspectos importantes. Ahora conviene concentrarte en los puntos pendientes y comprobar cómo se ve el conjunto desde afuera.'
        }
      ],
      // Reemplaza la lista de prioridades cuando todo está en «Sí, lo comprobé».
      todoResuelto: {
        titulo: 'Tenés una base comprobada.',
        texto: 'Con lo que respondiste no hay nada para corregir. Conviene repetir esta revisión cada tanto y sumar una mirada externa: lo que un viajero ve cambia con cada actualización de tus canales (sitio, redes, Google, plataformas).'
      }
    },

    // Cómo se nombra el estado de cada prioridad.
    estados: {
      no: 'Lo marcaste como un problema',
      parcial: 'Está en parte resuelto',
      sin_revisar: 'Todavía no lo comprobaste'
    },

    preguntas: [
      {
        n: 1, etapa: 'encuentren',
        aspecto: 'las búsquedas sin tu nombre',
        pregunta: '¿Te encuentran cuando buscan lo que ofrecés, sin escribir el nombre de tu negocio?',
        apoyo: {
          base: 'Pensá en alguien que busca un alojamiento, excursión o experiencia en tu destino y todavía no sabe que existís.',
          alojamiento: 'Pensá en alguien que busca un alojamiento en tu destino y todavía no sabe que existís.',
          agencia: 'Pensá en alguien que busca una excursión o una experiencia en tu destino y todavía no sabe que existís.',
          gastronomia: 'Pensá en alguien que busca dónde comer en tu destino y todavía no sabe que existís.'
        },
        comprobar: [
          'Buscá en Google y probá una consulta en una IA usando tu tipo de servicio, tu destino y alguna característica relevante. No escribas el nombre de tu negocio.',
          'Hacelo en una ventana de incógnito y sin sesión iniciada, para que tu historial no contamine el resultado.',
          {
            ejemplo: {
              base: '«[tu servicio] en [tu destino], con [una característica real de tu propuesta]»',
              alojamiento: '«Ecolodges en Misiones para observar aves»',
              agencia: '«Excursiones de un día con guía local en la selva misionera»',
              gastronomia: '«Restaurantes de cocina regional cerca de las Cataratas del Iguazú»'
            }
          },
          'Comprobá qué aparece. Una prueba es una observación puntual: las respuestas pueden variar.',
          {
            enlace: {
              antes: 'Tenés el paso a paso en la nota ',
              texto: '«Buscate vos»',
              url: 'https://onlike.ar/buscate-vos-que-dicen-las-ias.html',
              despues: '.'
            }
          }
        ],
        recomendacion: {
          titulo: 'Revisá cómo aparece tu negocio cuando buscan tu tipo de servicio',
          tituloPendiente: 'Comprobá si te encuentran cuando buscan tu tipo de servicio sin nombrarte',
          accion: 'Hacé búsquedas combinando actividad, destino y características reales de tu propuesta. Anotá qué aparece y revisá si tus textos públicos describen claramente esas características.'
        }
      },
      {
        n: 2, etapa: 'encuentren',
        aspecto: 'la clasificación de tu negocio',
        pregunta: '¿Los lugares donde figurás explican correctamente qué tipo de negocio tenés?',
        apoyo: 'Una categoría demasiado general puede dejar afuera características importantes de tu actividad.',
        comprobar: [
          'Revisá la categoría principal y los servicios de tu Perfil de Empresa en Google. Comparalos con tus fichas en plataformas o directorios.',
          {
            ejemplo: {
              base: 'un servicio con una propuesta específica descrito solamente con una categoría genérica',
              alojamiento: 'un ecolodge especializado en naturaleza descrito solamente como «hotel»',
              agencia: 'una agencia receptiva especializada en turismo de naturaleza descrita solamente como «agencia de viajes»',
              gastronomia: 'un restaurante de cocina regional descrito solamente como «restaurante»'
            }
          }
        ],
        recomendacion: {
          titulo: 'Comprobá cómo estás clasificado',
          tituloPendiente: 'Comprobá si tu categoría y tu descripción representan lo que hacés',
          accion: 'Revisá la categoría principal y la descripción de servicios en Google y en tus plataformas principales. Corregí clasificaciones que no representen tu actividad real.'
        }
      },
      {
        n: 3, etapa: 'encuentren',
        aspecto: 'las fuentes externas',
        pregunta: '¿Tu negocio aparece en fuentes externas relevantes para lo que ofrecés?',
        apoyo: 'Además de tus propios canales (tu sitio, tus redes, tu ficha de Google), hay lugares donde un viajero puede encontrar referencias sobre vos.',
        comprobar: [
          {
            base: 'Revisá si figurás correctamente en portales turísticos oficiales, registros del sector, directorios especializados, guías, operadores o plataformas vinculadas con tu actividad.',
            alojamiento: 'Revisá si figurás correctamente en portales turísticos oficiales, registros del sector, directorios especializados, guías y plataformas de reserva vinculadas con tu actividad.',
            agencia: 'Revisá si figurás correctamente en portales turísticos oficiales, registros de prestadores, directorios especializados, guías y operadores o agencias que trabajan tu destino.',
            gastronomia: 'Revisá si figurás correctamente en portales turísticos oficiales, guías gastronómicas, directorios especializados y notas de medios que hablen de la cocina de tu zona.'
          },
          'No hace falta aparecer en todos. Importa estar en los que utilizan tus potenciales clientes.'
        ],
        recomendacion: {
          titulo: 'Revisá dónde se habla de tu negocio fuera de tus propios canales (tu sitio y tus redes)',
          tituloPendiente: 'Comprobá si figurás, y si figurás bien, en fuentes externas relevantes',
          accion: 'Identificá los registros, portales y sitios especializados relevantes para tu actividad. Comprobá si estás incluido y si la información publicada es correcta.'
        }
      },
      {
        n: 4, etapa: 'entiendan',
        aspecto: 'la claridad de tu oferta',
        pregunta: '¿Alguien que no te conoce entiende claramente qué ofrecés y para quién es?',
        apoyo: 'Las fotos pueden atraer, pero la persona también necesita saber qué experiencia o servicio está evaluando.',
        comprobar: [
          'Abrí tu principal canal (tu sitio web, tu Instagram, tu ficha de Google u otro lugar donde presentás tu negocio) e imaginá que nunca escuchaste hablar de él.',
          {
            base: '¿Se entiende qué se puede hacer, qué incluye la propuesta y para qué tipo de viajero está pensada?',
            alojamiento: '¿Se entiende qué tipo de alojamiento es, qué incluye la estadía y para qué tipo de viajero está pensado?',
            agencia: '¿Se entiende qué actividades se hacen, qué incluye cada propuesta y para qué tipo de viajero está pensada?',
            gastronomia: '¿Se entiende qué tipo de cocina y de experiencia ofrecés y para qué tipo de viajero está pensada?'
          }
        ],
        recomendacion: {
          titulo: 'Explicá mejor qué experiencia o servicio ofrecés',
          tituloPendiente: 'Comprobá si alguien que no te conoce entiende qué ofrecés y para quién',
          accion: 'Revisá el primer texto que encuentra un visitante. Debería quedar claro qué ofrecés, dónde, para quién y qué puede esperar.'
        }
      },
      {
        n: 5, etapa: 'entiendan',
        aspecto: 'tus diferenciales',
        pregunta: '¿Lo que hace especial a tu negocio está explicado antes de que el viajero te contacte?',
        apoyo: 'Puede haber razones importantes por las que tus clientes te eligen y que todavía no aparecen en tu comunicación.',
        comprobar: [
          'Pensá en los elogios que recibís habitualmente.',
          {
            base: 'Puede ser la atención de los dueños, un guía especializado, una experiencia gastronómica, la tranquilidad del lugar o una actividad poco común.',
            alojamiento: 'Puede ser la atención de los dueños, la tranquilidad del lugar, el entorno natural o un servicio que otros alojamientos no ofrecen.',
            agencia: 'Puede ser un guía especializado, el conocimiento del lugar, el tamaño de los grupos o una actividad poco común.',
            gastronomia: 'Puede ser una receta, un producto local, la atención o el entorno donde se come.'
          },
          'Comprobá si eso aparece explicado con ejemplos concretos en tus canales (sitio, redes, Google, plataformas).'
        ],
        recomendacion: {
          titulo: 'Hacé visible aquello por lo que tus clientes te eligen',
          tituloPendiente: 'Comprobá si lo que te hace especial está explicado antes de que te contacten',
          accion: 'Identificá tres motivos concretos por los que te recomiendan. Comprobá si están explicados en tus principales canales (sitio, redes, Google, plataformas) con información verificable.'
        }
      },
      {
        n: 6, etapa: 'entiendan',
        aspecto: 'la explicación de tu ubicación',
        pregunta: '¿Tu ubicación está explicada de una manera útil para planificar un viaje?',
        apoyo: 'Saber dónde estás es apenas una parte. El viajero necesita entender qué implica llegar hasta ahí.',
        comprobar: [
          {
            base: 'Revisá si explicás cómo llegar, distancias reales, conexiones con atractivos, transporte y condiciones importantes del lugar.',
            agencia: 'Revisá si explicás dónde es el punto de encuentro o de salida, cómo llegar, cuánto dura cada traslado, el transporte y las condiciones importantes del recorrido.'
          },
          {
            ejemplo: {
              base: '«Cerca de todo» puede necesitar una explicación de las distancias reales y de cómo se llega.',
              alojamiento: '«A 50 km de Puerto Iguazú» puede necesitar una explicación sobre el acceso y el trayecto.',
              agencia: '«Salimos desde Puerto Iguazú» puede necesitar aclarar el punto exacto de encuentro y cuánto dura el traslado.',
              gastronomia: '«A diez minutos del centro» puede necesitar aclarar cómo se llega y dónde se estaciona.'
            }
          }
        ],
        recomendacion: {
          titulo: 'Explicá tu ubicación pensando en el viaje',
          tituloPendiente: 'Comprobá si tu ubicación sirve para planificar un viaje',
          accion: {
            base: 'Revisá distancias, accesos, conexiones y condiciones de llegada. Evitá descripciones ambiguas como “cerca de todo” cuando no explican el recorrido real.',
            agencia: 'Revisá que el punto de encuentro, los tiempos de traslado y las condiciones de llegada estén escritos con claridad. Evitá descripciones ambiguas como “cerca de todo” cuando no explican el recorrido real.'
          }
        }
      },
      {
        n: 7, etapa: 'elijan',
        aspecto: 'la información para decidir',
        pregunta: '¿El viajero encuentra la información que necesita para decidir antes de escribirte?',
        apoyo: 'Hay dudas que se pueden resolver antes del primer WhatsApp.',
        comprobar: [
          {
            base: 'Revisá qué incluye el servicio, qué gastos adicionales existen, condiciones de pago, cancelaciones, horarios, disponibilidad y características relevantes para tu rubro.',
            alojamiento: 'Revisá qué incluye la tarifa, qué gastos adicionales existen, condiciones de pago, cancelaciones, horarios de check-in y check-out, disponibilidad y características como mascotas, accesibilidad o servicios.',
            agencia: 'Revisá qué incluye cada propuesta, qué gastos adicionales existen, condiciones de pago, cancelaciones (también por clima), duración, horarios de salida, cupos y requisitos para participar.',
            gastronomia: 'Revisá días y horarios de atención, cómo se reserva, rango de precios, medios de pago y opciones para distintas dietas.'
          },
          'No todos los negocios necesitan publicar un precio cerrado, pero sí explicar cómo se determina o consulta.'
        ],
        recomendacion: {
          titulo: 'Respondé las dudas que pueden frenar una decisión',
          tituloPendiente: 'Comprobá si el viajero encuentra lo que necesita para decidir antes de escribirte',
          accion: 'Reuní las preguntas que recibís antes de una reserva. Publicá las respuestas importantes sobre inclusiones, condiciones, costos y funcionamiento en los canales correspondientes (tu sitio, tus redes, Google, plataformas).'
        }
      },
      {
        n: 8, etapa: 'elijan',
        aspecto: 'la coherencia entre canales',
        pregunta: '¿Tus distintos canales (sitio, redes, Google, plataformas) muestran los mismos servicios y condiciones vigentes?',
        apoyo: 'Un viajero puede consultar varios lugares antes de contratar. Las diferencias importantes pueden generarle dudas.',
        comprobar: [
          'Compará tu sitio, Google, Instagram y las plataformas donde vendés.',
          'Revisá servicios incluidos, horarios, precios o condiciones, características del producto y modalidad de reserva.',
          'No hace falta repetir las mismas palabras. Los hechos importantes deben ser compatibles.'
        ],
        recomendacion: {
          titulo: 'Corregí las diferencias entre tus canales (sitio, redes, Google, plataformas)',
          tituloPendiente: 'Comprobá si tus canales (sitio, redes, Google, plataformas) muestran los mismos servicios y condiciones',
          accion: 'Compará las condiciones, los servicios y los datos operativos de tus principales plataformas. Definí cuál es la información vigente y actualizá las demás fuentes.'
        }
      },
      {
        n: 9, etapa: 'elijan',
        aspecto: 'el uso de las reseñas',
        pregunta: '¿Estás aprovechando lo que tus clientes cuentan de vos en sus reseñas?',
        apoyo: 'Tus clientes pueden estar describiendo muy bien un diferencial que vos todavía no comunicás.',
        comprobar: [
          'Leé reseñas recientes, positivas y críticas.',
          '¿Qué elogios se repiten? ¿Qué reclamos aparecen? ¿Tu comunicación refleja esas fortalezas y aclara las expectativas que generan dudas?'
        ],
        recomendacion: {
          titulo: 'Usá lo que tus clientes cuentan para explicar mejor tu propuesta',
          tituloPendiente: 'Comprobá qué cuentan tus clientes en las reseñas y si tu comunicación lo refleja',
          accion: 'Revisá las reseñas recientes. Identificá elogios recurrentes, reclamos y expectativas mal interpretadas. Incorporá lo que corresponda a tu comunicación.'
        }
      },
      {
        n: 10, etapa: 'elijan',
        aspecto: 'el camino hasta la consulta o la reserva',
        pregunta: '¿Alguien que ya decidió contratarte puede avanzar sin obstáculos?',
        apoyo: 'La persona puede estar convencida y encontrar dificultades justo cuando quiere consultar o reservar.',
        comprobar: [
          'Probá el recorrido desde otro celular.',
          '¿Funciona el WhatsApp? ¿Es fácil encontrar cómo reservar? ¿Se entiende qué debe hacer? ¿Los enlaces llevan al lugar correcto? ¿La información necesaria aparece en el momento adecuado?'
        ],
        recomendacion: {
          titulo: 'Probá el recorrido hasta la consulta o reserva',
          tituloPendiente: 'Comprobá si quien ya decidió contratarte puede avanzar sin obstáculos',
          accion: 'Ingresá desde otro celular y completá el recorrido como si fueras un cliente nuevo. Corregí enlaces, pasos innecesarios o información que falte antes de confirmar.'
        }
      }
    ]
  };
});
