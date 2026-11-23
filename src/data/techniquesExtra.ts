import type { Technique } from './types';

const wiki = (title: string, label: string) => ({
  label: `${label} (Wikipedia)`,
  url: `https://es.wikipedia.org/wiki/${title}`,
});

// Resto del catálogo de recursos vocales.
export const extraTechniques: Technique[] = [
  // ---------- Adornos y afinación ----------
  {
    id: 'riffs',
    name: 'Riffs y runs',
    category: 'Adornos y afinación',
    color: '#B8327A',
    level: 'Avanzado',
    summary: 'Frases rápidas de varias notas, típicas del pop, el soul y el R&B.',
    whatIs:
      'Un riff o run es un melisma rápido y con estilo propio: una cascada de notas, normalmente sobre una escala pentatónica o de blues, que adorna el final de una frase. Es el sello de cantantes de soul, gospel y R&B.',
    howTo: [
      'Elige un riff corto (3 a 5 notas) y apréndelo muy despacio.',
      'Cántalo en una vocal abierta, sin consonantes entre notas.',
      'Marca el primer tiempo de cada grupo de notas para no perder el pulso.',
      'Aumenta la velocidad con metrónomo, 10 BPM cada vez.',
    ],
    commonMistakes: [
      'Ir rápido antes de afinar cada nota.',
      'Meter riffs en todas las frases: pierden impacto.',
      'Apretar la garganta en las notas agudas del riff.',
    ],
    exercises: [
      {
        title: 'Pentatónica en grupos de tres',
        steps: [
          'Canta la pentatónica menor bajando (La-Sol-Mi-Re-Do-La) en grupos de tres notas.',
          'Empieza a 60 BPM en corcheas y sube hasta 100 BPM.',
        ],
      },
      {
        title: 'Riff de final de frase',
        steps: [
          'Canta la palabra "yeah" y termina con Mi-Re-Do-La.',
          'Repite en tres tonalidades distintas.',
        ],
      },
    ],
    tutorials: [
      {
        videoId: 'M1ITw6KvdCE',
        title: 'Cómo cantar runs, riffs o melismas: tips y ejercicios',
        language: 'es',
      },
      {
        videoId: 'hIXVy-Fhpd0',
        title: 'Cómo cantar riffs, runs y melismas: vocalización',
        language: 'es',
      },
      { videoId: 'f_atPRAA_4o', title: 'Agilidad vocal para voces femeninas', language: 'es' },
      { videoId: 'HilAQ7haYvo', title: 'Agilidad vocal para voces masculinas', language: 'es' },
      { videoId: 'YsE6IBIxTCA', title: 'Riffs and runs for beginners', language: 'en' },
      { videoId: 'wj2y6FSdLfg', title: 'Pentatonic riffs and runs for beginners', language: 'en' },
    ],
    sources: [],
  },

  // ---------- Registros ----------
  {
    id: 'voz-pecho',
    name: 'Voz de pecho',
    category: 'Registros',
    color: '#A0522D',
    level: 'Básico',
    summary: 'El registro grave y medio, con sonido lleno, como al hablar.',
    whatIs:
      'La voz de pecho es el registro con el que hablamos. Se siente vibrar en el pecho y da un sonido cálido y potente en las notas graves y medias. El reto es subir sin empujar ni gritar.',
    howTo: [
      'Di "hey" con tono de llamar a alguien que está cerca y fíjate en la sensación.',
      'Canta esa misma sensación en notas cómodas de tu registro medio.',
      'Al subir, reduce un poco el volumen en lugar de empujar más aire.',
    ],
    commonMistakes: [
      'Subir la voz de pecho a la fuerza hasta gritar.',
      'Levantar la barbilla en las notas altas.',
    ],
    exercises: [
      {
        title: 'Escala hablada',
        steps: [
          'Di "ma-ma-ma" en tono de conversación.',
          'Conviértelo en una escala de cinco notas ascendente y descendente.',
          'Sube medio tono cada vez mientras siga cómodo.',
        ],
      },
    ],
    tutorials: [
      { videoId: 'MU9uLmJHJu4', title: 'Cantar con voz plena sin gritar', language: 'es' },
      { videoId: 'iBcylXpky_Y', title: '3 ejercicios para usar la voz de pecho', language: 'es' },
      { videoId: 'XTsLA4TW7ME', title: 'Entrena tu voz de pecho', language: 'es' },
      { videoId: 'n-37qQzqtEg', title: 'Voz de pecho: dos ejercicios diarios', language: 'es' },
      { videoId: 'podr5d77AVM', title: 'Voz de pecho explicada con ciencia', language: 'es' },
    ],
    sources: [wiki('Registro_vocal', 'Registro vocal')],
  },
  {
    id: 'voz-cabeza',
    name: 'Voz de cabeza',
    category: 'Registros',
    color: '#5B4BC4',
    level: 'Intermedio',
    summary: 'El registro agudo, con sensación de resonancia en la cabeza.',
    whatIs:
      'La voz de cabeza es el registro agudo. A diferencia del falsete, mantiene más cuerpo y cierre, por lo que suena más timbrada. Se siente vibrar en la cara y la cabeza.',
    howTo: [
      'Imita el sonido de un búho o de una sirena aguda y suave.',
      'Mantén la mandíbula suelta y la laringe estable.',
      'Poco a poco, añade un poco más de intensidad sin cambiar la sensación.',
    ],
    commonMistakes: [
      'Confundirla con el falsete muy aireado.',
      'Empujar desde la garganta para que suene más fuerte.',
    ],
    exercises: [
      {
        title: 'Sirena descendente',
        steps: [
          'Empieza en una nota aguda con "u" suave.',
          'Desliza hacia abajo hasta tu registro medio sin romper la voz.',
        ],
      },
    ],
    tutorials: [
      {
        videoId: '2QVVaE2wYZk',
        title: 'Cómo cantar falsete o voz de cabeza desde cero',
        language: 'es',
      },
      { videoId: 'YXyKHA7r3GE', title: 'How to sing your high head voice notes', language: 'en' },
      {
        videoId: '4-SCV-PwSsA',
        title: 'Ejercicios para fortalecer la voz de cabeza',
        language: 'es',
      },
      { videoId: 'rhLuXy4-f-M', title: '2 ejercicios para usar la voz de cabeza', language: 'es' },
      { videoId: 'c_BSxnjI1JE', title: 'Cómo cantar con voz de cabeza', language: 'es' },
    ],
    sources: [wiki('Registro_vocal', 'Registro vocal')],
  },
  {
    id: 'voz-mixta',
    name: 'Voz mixta',
    category: 'Registros',
    color: '#2F6FB0',
    level: 'Avanzado',
    summary: 'Una mezcla de pecho y cabeza para cantar agudos sin cortes.',
    whatIs:
      'La voz mixta combina la fuerza de la voz de pecho con la facilidad de la de cabeza. Permite cantar la zona de paso (donde la voz suele romperse) con un sonido uniforme.',
    howTo: [
      'Localiza tu zona de paso con una sirena lenta.',
      'Canta esa zona con una vocal estrecha ("u" o "i") y volumen moderado.',
      'Ve abriendo la vocal sin perder la sensación ligera.',
    ],
    commonMistakes: [
      'Llevar demasiado peso de pecho hacia arriba.',
      'Volverse aireado en la zona de paso.',
    ],
    exercises: [
      {
        title: '"Nei" en quintas',
        steps: [
          'Canta "nei-nei-nei" en una escala de cinco notas, con un sonido un poco nasal.',
          'Sube medio tono cada vez, atravesando la zona de paso.',
        ],
      },
      {
        title: 'Octava con "gu"',
        steps: [
          'Salta una octava con "gu" y vuelve bajando la escala.',
          'Mantén el mismo volumen arriba y abajo.',
        ],
      },
    ],
    tutorials: [
      {
        videoId: '1yn7p9KtJ7Q',
        title: 'Cantar con voz mixta: 6 ejercicios vocales',
        language: 'es',
      },
      { videoId: 'bxSzWmcIKU4', title: 'Cómo cantar notas altas con voz mixta', language: 'es' },
      {
        videoId: 'KQ97hIww9Rg',
        title: '¿Qué es la voz mixta? Ejercicios prácticos',
        language: 'es',
      },
      { videoId: '3mwiUCoTiFc', title: 'Voz mixta en 3 pasos', language: 'es' },
      { videoId: 'yfXBYprPA2c', title: 'Ejercicios para mezclar la voz', language: 'es' },
      { videoId: 't-GeakmWVvI', title: 'Cómo cantar con voz mixta', language: 'es' },
    ],
    sources: [wiki('Registro_vocal', 'Registro vocal')],
  },
  {
    id: 'quiebre',
    name: 'Quiebre',
    category: 'Registros',
    color: '#C2410C',
    level: 'Intermedio',
    summary: 'Un salto brusco y expresivo entre voz de pecho y falsete.',
    whatIs:
      'El quiebre es un cambio rápido e intencionado de la voz de pecho al falsete (o al revés), como en el "¡ay, ay, ay!" de la ranchera o en el yodel. Lo que en otros estilos sería un fallo, aquí es un recurso expresivo.',
    howTo: [
      'Canta una nota media en voz de pecho.',
      'Salta de golpe una quinta o una sexta arriba en falsete.',
      'Controla que el salto sea limpio, sin gritar.',
    ],
    commonMistakes: [
      'Gritar la nota aguda en lugar de soltarla en falsete.',
      'Hacerlo con la garganta tensa.',
    ],
    exercises: [
      {
        title: 'Ay de pecho a falsete',
        steps: [
          'Canta "a" en pecho y salta a "y" en falsete: "a-y".',
          'Repite bajando y subiendo medio tono.',
        ],
      },
    ],
    tutorials: [
      {
        videoId: 'gH_QhApA-ao',
        title: 'Mariachi vocal tutorial: how to sing falsetto',
        language: 'en',
      },
      { videoId: 'Vt9lv5kb2CM', title: 'Mariachi vocal tutorial', language: 'en' },
      { videoId: 'leXIoQoIynQ', title: 'Cómo cantar rancheras (voces femeninas)', language: 'es' },
    ],
    sources: [],
  },

  // ---------- Color y emisión ----------
  {
    id: 'belting',
    name: 'Belting',
    category: 'Color y emisión',
    color: '#DC2626',
    level: 'Avanzado',
    summary: 'Cantar agudos con mucha potencia y brillo, sin gritar.',
    whatIs:
      'El belting es una forma de cantar notas medias y agudas con un sonido potente y brillante, como en el musical o el pop. Bien hecho no daña la voz: se apoya en un buen cierre de las cuerdas, resonancia brillante y una laringe algo más alta.',
    howTo: [
      'Habla con energía, como si llamaras a alguien a lo lejos ("¡ey!").',
      'Usa vocales abiertas y brillantes ("e", "a").',
      'Mantén el apoyo del abdomen y no empujes más aire del necesario.',
    ],
    commonMistakes: [
      'Gritar y apretar el cuello.',
      'Llevar la voz de pecho sin control hasta el límite.',
      'Practicarlo sin calentar antes.',
    ],
    exercises: [
      {
        title: 'Llamada "¡ey!"',
        steps: [
          'Di "¡ey!" como si llamaras a alguien.',
          'Cántalo en una quinta descendente (Sol-Do).',
          'Sube medio tono cada vez, sin perder la sensación de hablar.',
        ],
      },
    ],
    tutorials: [
      {
        videoId: 'MU9uLmJHJu4',
        title: 'Belting: cómo cantar con voz plena sin gritar',
        language: 'es',
      },
      { videoId: 'LGRnnSTQ88Y', title: '5 ejercicios para cantar con belting', language: 'es' },
      { videoId: 'OYBAO52GuzM', title: 'Vocal exercises for belting', language: 'en' },
      {
        videoId: 'xz98X2xK_5U',
        title: 'Belting: 6 pasos para aprender la técnica',
        language: 'es',
      },
      { videoId: 'n3QnufsiNxU', title: 'Cómo cantar de pecho con belting', language: 'es' },
      { videoId: 'brxALKpfUBc', title: 'Entrena un belting sano', language: 'es' },
      { videoId: '7SGudrmW_Ew', title: 'Belting vocal para agudos', language: 'es' },
    ],
    sources: [],
  },
  {
    id: 'twang',
    name: 'Twang',
    category: 'Color y emisión',
    color: '#CA8A04',
    level: 'Intermedio',
    summary: 'Un sonido brillante y "metálico" que da proyección sin esfuerzo.',
    whatIs:
      'El twang estrecha una parte de la garganta (el epilaringe) y produce un sonido brillante, algo nasal, que se oye mucho sin cantar más fuerte. Es la base del country, del rock y de muchos agudos potentes.',
    howTo: [
      'Imita el "nyeee" de una bruja o el quejido de un pato.',
      'Fíjate en que el sonido se vuelve más brillante sin subir el volumen.',
      'Rebaja la intensidad del efecto hasta que suene musical.',
    ],
    commonMistakes: ['Confundirlo con cantar por la nariz.', 'Exagerarlo en toda la canción.'],
    exercises: [
      {
        title: '"Nyeee" en escala',
        steps: [
          'Canta "nyeee" en una escala de cinco notas.',
          'Repite con "nyaaa" manteniendo el brillo.',
        ],
      },
    ],
    tutorials: [
      { videoId: 'bngdLoQrWg0', title: 'Usa el twang para cantar agudos potentes', language: 'es' },
      {
        videoId: 'vrg0z38yscs',
        title: 'A fantastic vocal exercise for twang singing',
        language: 'en',
      },
      { videoId: '-e5ULS6EURU', title: 'Vocal twang: definition and exercises', language: 'en' },
      { videoId: 'tiCal6CFeWE', title: 'Técnica vocal: el twang', language: 'es' },
      { videoId: 'XVjABEehwQQ', title: 'Proyecta la voz sin gritar con twang', language: 'es' },
      { videoId: 'VQr96uzxJKo', title: 'Ejercicios de twang para más brillo', language: 'es' },
    ],
    sources: [],
  },
  {
    id: 'voz-aireada',
    name: 'Voz aireada',
    category: 'Color y emisión',
    color: '#0891B2',
    level: 'Básico',
    summary: 'Un sonido suave e íntimo, con aire audible.',
    whatIs:
      'En la voz aireada (breathy) las cuerdas vocales no se cierran del todo y se oye el aire. Da un color íntimo y cercano, muy usado en el pop actual y en baladas. Es un recurso, no un hábito: usarla siempre cansa la voz.',
    howTo: [
      'Suspira suavemente sobre una nota cómoda.',
      'Añade un poco de tono al suspiro hasta que se oiga la nota con aire.',
      'Úsala en momentos concretos (inicio de frase, final suave).',
    ],
    commonMistakes: [
      'Cantar toda la canción aireado y quedarse sin aire.',
      'No saber volver a un sonido limpio.',
    ],
    exercises: [
      {
        title: 'Del suspiro a la nota',
        steps: [
          'Empieza una frase con aire y termina con sonido limpio.',
          'Luego al revés: limpio al principio y aireado al final.',
        ],
      },
    ],
    tutorials: [
      {
        videoId: '6LgV49DoFag',
        title: 'Cómo cantar con voz airosa (breathy voice)',
        language: 'es',
      },
      {
        videoId: 'izLW4B4UtlE',
        title: 'Breathy singing: how to hold your vocal cords apart',
        language: 'en',
      },
      { videoId: 'Ps2xK1uuaDw', title: 'Voz aireada y voz nasal combinadas', language: 'es' },
      { videoId: 'e2BE1N3FIAc', title: 'How to sing with a breathy tone', language: 'en' },
      { videoId: 'arFmwgsWhWg', title: 'How to develop a breathy singing voice', language: 'en' },
    ],
    sources: [],
  },
  {
    id: 'vocal-fry',
    name: 'Vocal fry',
    category: 'Color y emisión',
    color: '#78716C',
    level: 'Intermedio',
    summary: 'Un sonido grave y crepitante, como una puerta que chirría.',
    whatIs:
      'El vocal fry es el registro más grave: las cuerdas vibran muy despacio y producen un crepitar. Se usa como adorno al empezar una frase (muy típico del pop) y también como ejercicio para relajar la voz.',
    howTo: [
      'Di "ah" lo más grave y relajado posible, con muy poco aire.',
      'Escucha el crepitar y mantenlo unos segundos.',
      'Úsalo para entrar en la primera nota de una frase.',
    ],
    commonMistakes: ['Empujarlo con fuerza.', 'Abusar de él en todas las entradas.'],
    exercises: [
      {
        title: 'Fry a nota',
        steps: [
          'Empieza en fry y pasa suavemente a una nota cómoda.',
          'Repite en distintas notas.',
        ],
      },
    ],
    tutorials: [
      {
        videoId: 'YAD_oJJyOfg',
        title: 'Vocal fry: qué es, cómo se hace y cómo se usa',
        language: 'es',
      },
      {
        videoId: '-GV5Yxu8t3Y',
        title: 'Cantar notas graves: ejercicios de vocal fry',
        language: 'es',
      },
      { videoId: 'f75io0JLiEU', title: 'Usar el vocal fry para la voz mixta', language: 'es' },
    ],
    sources: [],
  },
  {
    id: 'voz-rasgada',
    name: 'Voz rasgada',
    category: 'Color y emisión',
    color: '#9F1239',
    level: 'Avanzado',
    summary: 'Una distorsión controlada que da un sonido áspero y emotivo.',
    whatIs:
      'La voz rasgada (rasp o distorsión) añade aspereza al sonido usando estructuras por encima de las cuerdas vocales, no las cuerdas en sí. Bien hecha no hace daño, pero debe aprenderse con calma y con apoyo de un profesor.',
    howTo: [
      'Parte de un sonido sano y apoyado.',
      'Añade la distorsión poco a poco, empezando por el vocal fry.',
      'Para en cuanto notes molestia o picor.',
    ],
    commonMistakes: ['Raspar la garganta para conseguirlo.', 'Practicar mucho tiempo seguido.'],
    exercises: [
      {
        title: 'Fry con aire',
        steps: [
          'Empieza con un vocal fry suave.',
          'Añade aire y una nota, buscando un sonido áspero sin dolor.',
          'Practica solo 2 o 3 minutos al día al principio.',
        ],
      },
    ],
    tutorials: [
      { videoId: 'lcuELlCy8no', title: 'Distorsiones vocales sin dañarte la voz', language: 'es' },
      { videoId: 'PFEZnDwfAqU', title: 'Cómo comenzar a hacer voz raspada', language: 'es' },
      {
        videoId: 'zR_vNDA0-28',
        title: 'How to add rasp and distortion without hurting your voice',
        language: 'en',
      },
      { videoId: 'YHr1jh8yfcE', title: 'Formas de hacer la voz rota o rasgada', language: 'es' },
      { videoId: 'PKSAPgC_rw8', title: 'Gritty or raspy voice tutorial', language: 'en' },
    ],
    sources: [],
  },
  {
    id: 'sollozo',
    name: 'Sollozo',
    category: 'Color y emisión',
    color: '#4F46E5',
    level: 'Intermedio',
    summary: 'Un "llanto" en la voz que añade emoción y suaviza los agudos.',
    whatIs:
      'El sollozo (cry) imita el gesto de llorar o gimotear: inclina ligeramente la laringe y da un color emotivo y quebrado. Es muy típico del bolero, la ranchera y el flamenco, y además ayuda a llegar a los agudos sin forzar.',
    howTo: [
      'Imita el gimoteo de un perrito ("ung") en una nota media.',
      'Mantén esa sensación al cantar una palabra.',
      'Úsalo en las palabras más emotivas de la canción.',
    ],
    commonMistakes: [
      'Exagerarlo hasta que suene teatral.',
      'Perder la afinación al "quebrar" la voz.',
    ],
    exercises: [
      {
        title: 'Gimoteo en quintas',
        steps: [
          'Canta "ung" con sensación de gimoteo en una escala de cinco notas.',
          'Abre a "a" manteniendo la sensación.',
        ],
      },
    ],
    tutorials: [
      {
        videoId: 'CbKx5Mbn4dQ',
        title: 'How to sing higher notes without straining (cry technique)',
        language: 'en',
      },
      { videoId: '1w1Ng5qVwAI', title: 'How to apply cry and whimper to songs', language: 'en' },
      { videoId: 'Fm907jBn7Ww', title: 'The vocal cry techniques', language: 'en' },
      { videoId: 'XU2PGVih4W4', title: 'Using cry quality to sing better', language: 'en' },
    ],
    sources: [],
  },

  // ---------- Articulación y dinámica ----------
  {
    id: 'legato',
    name: 'Legato',
    category: 'Articulación y dinámica',
    color: '#15803D',
    level: 'Básico',
    summary: 'Cantar las notas unidas, sin cortes entre ellas.',
    whatIs:
      'Cantar legato es unir las notas y las palabras en una línea continua, como si fuera un solo soplo de aire. Es la base de las baladas y del canto lírico.',
    howTo: [
      'Mantén el aire fluyendo de forma constante durante toda la frase.',
      'Pasa rápido por las consonantes y alarga las vocales.',
      'Piensa en la frase entera, no nota a nota.',
    ],
    commonMistakes: [
      'Cortar el aire en cada consonante.',
      'Cambiar el color de las vocales en cada nota.',
    ],
    exercises: [
      {
        title: 'Frase solo con vocales',
        steps: [
          'Canta una frase de una canción usando solo sus vocales.',
          'Vuelve a cantarla con la letra, manteniendo la misma continuidad.',
        ],
      },
    ],
    tutorials: [
      { videoId: 'QpRPChZLzcw', title: 'Vocalizo para trabajar el legato', language: 'es' },
      { videoId: 'dUzGISzGVq4', title: '3 ejercicios de legato', language: 'es' },
      { videoId: 'S6pXe7aqnxo', title: '4 legato exercises for smooth singing', language: 'en' },
      { videoId: 'K7Rkx-RAdS4', title: 'Legato warm-up in 5 minutes', language: 'en' },
      { videoId: 'JCZlR1Sw8MQ', title: 'Legato exercises for a smooth line', language: 'en' },
    ],
    sources: [wiki('Legato', 'Legato')],
  },
  {
    id: 'staccato',
    name: 'Staccato',
    category: 'Articulación y dinámica',
    color: '#0F766E',
    level: 'Básico',
    summary: 'Notas cortas y separadas, con ataques limpios.',
    whatIs:
      'El staccato separa cada nota con un pequeño silencio. Da ritmo y chispa a una frase y, como ejercicio, entrena el apoyo del abdomen y los ataques limpios.',
    howTo: [
      'Da pequeños impulsos de aire desde el abdomen ("ja-ja-ja").',
      'Cada nota empieza limpia, sin golpe de garganta.',
      'Mantén la afinación aunque las notas sean muy cortas.',
    ],
    commonMistakes: [
      'Atacar cada nota con un golpe de glotis.',
      'Perder la afinación al acortar las notas.',
    ],
    exercises: [
      {
        title: 'Arpegio en staccato',
        steps: ['Canta Do-Mi-Sol-Do-Sol-Mi-Do en "ja" cortos.', 'Sube medio tono cada vez.'],
      },
    ],
    tutorials: [
      { videoId: 'UtIRoSckgIU', title: 'Ejercicio de respiración "staccato"', language: 'es' },
      { videoId: 'vVJCWHLjCjM', title: 'Qué es el apoyo para cantar', language: 'es' },
      { videoId: 'r56r9I7Hyzs', title: 'Ejercitar el staccato', language: 'es' },
      { videoId: 'J0oYL0I9WnM', title: 'Staccato vocal exercises', language: 'en' },
      { videoId: 'MTrGkadTBjM', title: 'Legato and staccato warm-up', language: 'en' },
    ],
    sources: [wiki('Staccato', 'Staccato')],
  },
  {
    id: 'messa-di-voce',
    name: 'Messa di voce',
    category: 'Articulación y dinámica',
    color: '#7E22CE',
    level: 'Avanzado',
    summary: 'Crecer y decrecer en volumen sobre una misma nota larga.',
    whatIs:
      'La messa di voce consiste en empezar una nota piano, crecer hasta forte y volver a piano sin que cambie la afinación ni el color. Es un ejercicio clásico de control y un recurso muy expresivo en notas largas.',
    howTo: [
      'Empieza la nota muy suave.',
      'Crece poco a poco durante 4 tiempos y decrece durante otros 4.',
      'Mantén la afinación estable en todo momento.',
    ],
    commonMistakes: [
      'Desafinar al crecer.',
      'Cambiar de registro bruscamente al bajar el volumen.',
    ],
    exercises: [
      {
        title: 'Nota de 8 tiempos',
        steps: [
          'Elige una nota cómoda y cántala en "a".',
          'Crece durante 4 tiempos y decrece durante otros 4.',
          'Repite en notas más agudas.',
        ],
      },
    ],
    tutorials: [
      { videoId: 'KnXr4eQIFNA', title: 'What is messa di voce?', language: 'en' },
      {
        videoId: 'GPqtBs3jdto',
        title: 'Exercise for better decrescendo and sustained notes',
        language: 'en',
      },
      { videoId: 'MbFjKRMtIUM', title: 'Messa di voce con Olga Bermúdez', language: 'es' },
      {
        videoId: 'HlGl2mS7-g8',
        title: 'The hardest vocal exercise: messa di voce',
        language: 'en',
      },
      { videoId: '90qzHzsZ62E', title: 'What is messa di voce?', language: 'en' },
    ],
    sources: [],
  },
];
