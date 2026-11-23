// Ejercicios y rutinas de calentamiento vocal. Una rutina es una lista de pasos con su duración,
// pensada para seguirla con el temporizador de la pantalla de calentamiento.

export interface WarmupStep {
  id: string;
  name: string;
  /** Para qué sirve, en una frase. */
  goal: string;
  instructions: string[];
  seconds: number;
  color: string;
}

export interface WarmupRoutine {
  id: string;
  name: string;
  description: string;
  steps: string[];
}

export const warmupSteps: WarmupStep[] = [
  {
    id: 'cuerpo',
    name: 'Suelta el cuerpo',
    goal: 'Quitar tensión de cuello, hombros y mandíbula.',
    instructions: [
      'Gira los hombros hacia atrás despacio, 5 veces.',
      'Inclina la cabeza a un lado y al otro, sin forzar.',
      'Masajea la mandíbula con las yemas de los dedos y deja la boca entreabierta.',
    ],
    seconds: 60,
    color: '#0E8F80',
  },
  {
    id: 'respiracion',
    name: 'Respiración',
    goal: 'Activar el apoyo del abdomen y controlar la salida del aire.',
    instructions: [
      'Inspira por la nariz en 4 tiempos, notando cómo se expanden el abdomen y las costillas.',
      'Suelta el aire con una "s" larga y constante durante 8 tiempos.',
      'Repite 4 veces, alargando la "s" un poco cada vez.',
    ],
    seconds: 60,
    color: '#2F6FB0',
  },
  {
    id: 'lip-trill',
    name: 'Vibración de labios',
    goal: 'Calentar la voz con muy poco esfuerzo y equilibrar aire y sonido.',
    instructions: [
      'Haz vibrar los labios como una moto ("brrr"). Si cuesta, empuja suavemente las mejillas con los dedos.',
      'Añade sonido y haz una escala de cinco notas subiendo y bajando.',
      'Sube medio tono cada vez mientras sea cómodo.',
    ],
    seconds: 90,
    color: '#D12F7A',
  },
  {
    id: 'humming',
    name: 'Boca cerrada (humming)',
    goal: 'Despertar la resonancia en la cara sin cargar la garganta.',
    instructions: [
      'Con los labios juntos y los dientes separados, haz "mmm" en una nota cómoda.',
      'Busca la vibración en labios y nariz.',
      'Haz una escala de cinco notas y termina abriendo a "maaa".',
    ],
    seconds: 60,
    color: '#7445D6',
  },
  {
    id: 'pajita',
    name: 'Fonación con pajita',
    goal: 'Ejercicio de tracto semiocluido: calienta y protege la voz.',
    instructions: [
      'Pon una pajita entre los labios (vale con los labios casi cerrados en "u" si no tienes).',
      'Haz sonido a través de ella en una nota cómoda, sin que se escape aire por la nariz.',
      'Desliza la voz de grave a agudo y de vuelta.',
    ],
    seconds: 60,
    color: '#C25E00',
  },
  {
    id: 'sirenas',
    name: 'Sirenas',
    goal: 'Recorrer todo el rango y suavizar el paso entre registros.',
    instructions: [
      'Con "ng" (como en "tengo"), desliza la voz desde tu nota más grave cómoda hasta la más aguda.',
      'Vuelve bajando igual de suave.',
      'Fíjate en no hacer saltos en el paso de registro.',
    ],
    seconds: 60,
    color: '#3D63DD',
  },
  {
    id: 'vocales',
    name: 'Vocales en escala',
    goal: 'Igualar el sonido de las vocales a lo largo de la escala.',
    instructions: [
      'Canta "mi-me-ma-mo-mu" en una sola nota.',
      'Repite sobre una escala de cinco notas.',
      'Mantén el mismo color en todas las vocales.',
    ],
    seconds: 90,
    color: '#15803D',
  },
  {
    id: 'staccato',
    name: 'Arpegio en staccato',
    goal: 'Activar el apoyo y los ataques limpios.',
    instructions: [
      'Canta "ja-ja-ja-ja" en un arpegio (Do-Mi-Sol-Do y bajando).',
      'Cada nota sale con un pequeño impulso del abdomen, sin golpe de garganta.',
      'Sube medio tono cada vez.',
    ],
    seconds: 60,
    color: '#0F766E',
  },
  {
    id: 'articulacion',
    name: 'Articulación',
    goal: 'Despertar lengua y labios para pronunciar con claridad.',
    instructions: [
      'Di rápido y con claridad: "pa-ta-ka, pa-ta-ka".',
      'Cántalo en una nota y luego en una escala.',
      'Termina con un trabalenguas que te guste.',
    ],
    seconds: 45,
    color: '#DC2626',
  },
];

export const warmupRoutines: WarmupRoutine[] = [
  {
    id: 'rapido',
    name: 'Rápido',
    description: 'Lo esencial antes de cantar una canción.',
    steps: ['cuerpo', 'respiracion', 'lip-trill', 'humming', 'sirenas'],
  },
  {
    id: 'completo',
    name: 'Completo',
    description: 'Para antes de una clase, un ensayo o una actuación.',
    steps: [
      'cuerpo',
      'respiracion',
      'lip-trill',
      'humming',
      'pajita',
      'sirenas',
      'vocales',
      'staccato',
      'articulacion',
    ],
  },
];

export const warmupVideos = [
  { videoId: 'kjVTF5xdOjU', title: 'Cómo calentar la voz antes de cantar en 5 minutos' },
  { videoId: 'ytuKUpGoJq0', title: 'Rutina completa de calentamiento vocal (15 min)' },
  { videoId: 'IfHPMOGmVJI', title: '¿Cómo se hace el lip trill?' },
];

export const stepById = (id: string) => warmupSteps.find((s) => s.id === id)!;

export const routineMinutes = (r: WarmupRoutine) =>
  Math.round(r.steps.reduce((acc, id) => acc + stepById(id).seconds, 0) / 60);
