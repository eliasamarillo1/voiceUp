import type { Technique } from './types';

// Catálogo global de recursos vocales. Se escribe una vez y sirve para todas las canciones.
// Los vídeos son tutoriales públicos de YouTube; se reproducen con el reproductor oficial.

export const techniques: Technique[] = [
  {
    id: 'vibrato',
    name: 'Vibrato',
    color: '#7C9CFF',
    level: 'Intermedio',
    summary: 'Una oscilación regular y suave de la afinación sobre una nota sostenida.',
    whatIs:
      'El vibrato es una pequeña ondulación de la altura de la nota, de unas 5 a 7 veces por segundo, que aparece cuando la voz sostiene una nota de forma libre y apoyada. No se fabrica moviendo la mandíbula o la garganta: surge cuando hay equilibrio entre el aire y el cierre de las cuerdas vocales.',
    howTo: [
      'Sostén una nota cómoda en tu registro medio con buen apoyo de aire.',
      'Relaja mandíbula, lengua y cuello; la nota debe sentirse libre, no apretada.',
      'Deja que la nota ondule ligeramente, sin forzarla. Al principio puedes alternar dos notas muy cercanas despacio.',
      'Aplícalo al final de las frases largas, que es donde más se usa.',
    ],
    commonMistakes: [
      'Mover la mandíbula o la cabeza para "fabricar" la ondulación.',
      'Un vibrato demasiado ancho o lento, que suena a temblor.',
      'Ponerlo en todas las notas, también en las cortas.',
    ],
    exercises: [
      {
        title: 'Alternancia lenta de semitono',
        steps: [
          'Elige una nota cómoda (por ejemplo, Do4) y la nota de un semitono más arriba.',
          'Alterna entre las dos con la vocal "u" a 2 cambios por segundo durante 8 segundos.',
          'Sube poco a poco a 4 y luego a 6 cambios por segundo, sin cortar el aire.',
          'Reduce la distancia hasta que dejes de sentir dos notas y oigas una sola que ondula.',
        ],
      },
      {
        title: 'Nota larga con vibrato al final',
        steps: [
          'Canta una nota recta durante 4 tiempos.',
          'En los 4 tiempos siguientes, suelta la tensión y deja aparecer el vibrato.',
          'Repite en 5 notas distintas de tu registro.',
        ],
      },
      {
        title: 'Vibrato con pulsos de aire',
        steps: [
          'Con la boca cerrada (humming), da pequeños impulsos suaves desde el abdomen.',
          'Acelera los impulsos hasta que se unan en una ondulación continua.',
          'Abre a la vocal "a" manteniendo la sensación.',
        ],
      },
    ],
    tutorials: [
      { videoId: '_LWlrBlrh3M', title: 'Cómo cantar con vibrato: ejercicios (1/3)', language: 'es' },
      { videoId: 'w_HpI-bhrYI', title: '¿Cómo hacer vibrato con la voz? ¿Qué es el vibrato?', language: 'es' },
      { videoId: 'R79AVrbOvAE', title: 'How To Sing With Vibrato', language: 'en' },
    ],
    sources: [{ label: 'Vibrato (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Vibrato' }],
  },
  {
    id: 'glissando',
    name: 'Glissando',
    color: '#2ED3B7',
    level: 'Básico',
    summary: 'Un deslizamiento continuo de la voz que recorre todas las alturas entre dos notas.',
    whatIs:
      'En el glissando la voz "resbala" de una nota a otra pasando por todas las alturas intermedias, como una sirena. Se usa como efecto expresivo y, sobre todo, como ejercicio para unir los registros de la voz sin saltos.',
    howTo: [
      'Empieza en una nota grave cómoda.',
      'Desliza la voz hacia arriba de forma continua, sin escalones, hasta una nota aguda.',
      'Mantén el mismo volumen y el mismo aire durante todo el recorrido.',
      'Haz el camino de vuelta hacia abajo con la misma suavidad.',
    ],
    commonMistakes: [
      'Hacer "escalones" en lugar de un deslizamiento continuo.',
      'Empujar más aire o subir el volumen al llegar al agudo.',
      'Romper la voz en el paso de registro en vez de suavizarlo.',
    ],
    exercises: [
      {
        title: 'Sirena con labios (lip trill)',
        steps: [
          'Haz vibrar los labios como una moto ("brrr").',
          'Sin parar la vibración, desliza la voz de grave a agudo y de vuelta.',
          'Repite 5 veces, ampliando poco a poco el recorrido.',
        ],
      },
      {
        title: 'Sirena en "ng"',
        steps: [
          'Coloca la lengua como al decir "ng" (de "tengo").',
          'Desliza de una quinta a la octava arriba y vuelve.',
          'Fíjate en que el paso por el registro medio no tenga saltos.',
        ],
      },
      {
        title: 'Glissando de quinta con vocal',
        steps: [
          'Canta Do4 en "a" y desliza hasta Sol4.',
          'Sube medio tono y repite, hasta donde estés cómodo.',
        ],
      },
    ],
    tutorials: [
      { videoId: 'FbafpUT66-w', title: 'Canto: glissando y portamento', language: 'es' },
      { videoId: 'hFkZCweeU9g', title: 'Glissando vocal exercise', language: 'en' },
      { videoId: 'uMpSZB4T6bs', title: 'Glissando 1a: transición suave entre registros', language: 'en' },
    ],
    sources: [{ label: 'Glissando (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Glissando' }],
  },
  {
    id: 'portamento',
    name: 'Portamento',
    color: '#FFB547',
    level: 'Intermedio',
    summary: 'Un enlace breve y expresivo entre dos notas, "llevando" la voz de una a otra.',
    whatIs:
      'El portamento es parecido al glissando, pero más corto y musical: la voz se desliza solo al final de una nota para llegar a la siguiente, casi siempre en la misma sílaba o al cambiar de sílaba. Da sensación de ternura o de dramatismo, y es muy típico del bolero, la ranchera y la canción lírica.',
    howTo: [
      'Canta la primera nota con su duración normal.',
      'Justo antes de cambiar, desliza rápidamente hacia la nota siguiente.',
      'Llega afinado y quédate en la nueva nota sin "rebotar".',
    ],
    commonMistakes: [
      'Usarlo en todas las notas: pierde efecto y suena desafinado.',
      'Deslizar demasiado despacio y llegar tarde a la nota.',
      'Pasarse de la nota de llegada y corregir después.',
    ],
    exercises: [
      {
        title: 'Terceras ligadas',
        steps: [
          'Canta Do4 y Mi4 en la vocal "o", con un portamento corto entre ellas.',
          'Repite bajando de Mi4 a Do4.',
          'Practica con terceras, cuartas y quintas.',
        ],
      },
      {
        title: 'Portamento en una frase',
        steps: [
          'Elige una frase lenta de una canción que te guste.',
          'Marca dos lugares donde un portamento tendría sentido (finales de palabra).',
          'Cántala primero sin portamento y después con él, y compara.',
        ],
      },
    ],
    tutorials: [
      { videoId: 'FbafpUT66-w', title: 'Canto: glissando y portamento', language: 'es' },
      { videoId: 'YfKqAI2_nOo', title: 'How to Portamento', language: 'en' },
    ],
    sources: [{ label: 'Portamento (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Portamento' }],
  },
  {
    id: 'melisma',
    name: 'Melisma',
    color: '#FF6FB1',
    level: 'Avanzado',
    summary: 'Varias notas cantadas sobre una misma sílaba.',
    whatIs:
      'Un melisma es un grupo de notas distintas que se cantan sobre una sola sílaba. Va desde un adorno de dos notas hasta las "carreras" (runs y riffs) del pop, el soul o el flamenco. Requiere agilidad: cambiar de nota rápido sin perder afinación ni aire.',
    howTo: [
      'Aprende primero las notas del melisma despacio, una a una.',
      'Cántalas en la vocal de la sílaba, sin volver a articular consonantes.',
      'Sube la velocidad poco a poco, con metrónomo, sin perder claridad.',
    ],
    commonMistakes: [
      'Ir rápido antes de que las notas estén claras: se vuelve un borrón.',
      'Añadir "h" entre notas (ha-ha-ha) en lugar de ligarlas.',
      'Cerrar la garganta en las notas rápidas.',
    ],
    exercises: [
      {
        title: 'Escala de cinco notas',
        steps: [
          'Canta Do-Re-Mi-Fa-Sol-Fa-Mi-Re-Do en una sola "a", a 60 BPM.',
          'Sube a 80, 100 y 120 BPM solo cuando salga limpio.',
          'Sube medio tono y repite.',
        ],
      },
      {
        title: 'Escala pentatónica (el "run" del pop)',
        steps: [
          'Canta la pentatónica menor bajando: La-Sol-Mi-Re-Do-La.',
          'Hazla primero en negras, luego en corcheas y luego en semicorcheas.',
        ],
      },
      {
        title: 'Copiar un adorno',
        steps: [
          'Escucha un melisma corto de una canción y ralentízalo.',
          'Escribe o tararea las notas una a una.',
          'Vuelve a la velocidad original por pasos.',
        ],
      },
    ],
    tutorials: [
      { videoId: '4-mbqr7m3q0', title: '¿Cómo cantar melismas? 5 pasos', language: 'es' },
      { videoId: 'tX5g1s_b9HQ', title: 'Técnica para runs, riffs y melismas', language: 'es' },
      { videoId: 'ZqfO6j5gNoE', title: 'How to Sing Riffs, Melismas and Runs Smoothly', language: 'en' },
    ],
    sources: [{ label: 'Melisma (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Melisma' }],
  },
  {
    id: 'falsete',
    name: 'Falsete',
    color: '#B98BFF',
    level: 'Intermedio',
    summary: 'Un registro ligero y aireado que permite llegar a notas agudas con suavidad.',
    whatIs:
      'El falsete es un modo de vibración en el que solo vibra el borde de las cuerdas vocales. Suena más ligero y aireado que la voz de pecho y permite notas agudas sin esfuerzo. En la música mexicana se usa el "quiebre": pasar de golpe de la voz de pecho al falsete.',
    howTo: [
      'Imita el sonido de un búho ("uuu") en una nota aguda y suave.',
      'Mantén poco volumen y la laringe relajada.',
      'Practica después el paso de voz de pecho a falsete en la misma vocal.',
    ],
    commonMistakes: [
      'Apretar la garganta para subir más.',
      'Confundirlo con gritar en el agudo.',
      'No practicar el paso entre registros, que es donde se rompe la voz.',
    ],
    exercises: [
      {
        title: 'El búho',
        steps: [
          'Di "uuu" como un búho en una nota aguda y suave.',
          'Baja deslizando la voz sin cambiar la sensación ligera.',
          'Repite 5 veces.',
        ],
      },
      {
        title: 'Quiebre pecho-falsete',
        steps: [
          'Canta una nota media en voz de pecho con la vocal "a".',
          'Salta una quinta arriba en falsete, en la misma vocal.',
          'Repite hasta que el paso sea limpio y controlado.',
        ],
      },
    ],
    tutorials: [
      { videoId: '2QVVaE2wYZk', title: 'Cómo cantar falsete o voz de cabeza desde cero', language: 'es' },
      { videoId: 'o94BpiOLcRE', title: 'Ejercicios de canto: falsete o voz de cabeza', language: 'es' },
      { videoId: 'gH_QhApA-ao', title: 'Mariachi vocal tutorial: how to sing falsetto', language: 'en' },
    ],
    sources: [{ label: 'Falsete (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Falsete' }],
  },
];

export const techniqueById = (id: string) => techniques.find((t) => t.id === id);
