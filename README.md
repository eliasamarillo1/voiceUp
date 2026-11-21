# VoiceUp

Biblioteca de canciones para cantantes. Buscas una canción y entras en su "carpeta": estructura,
tonalidades, letra sincronizada, partitura y los **recursos vocales** que usa (vibrato, glissando,
portamento, melisma, falsete…). Cada recurso tiene su explicación, ejercicios para practicarlo y
tutoriales de YouTube que se reproducen dentro de la app.

Este repositorio contiene el **prototipo web** con 3 canciones de ejemplo de dominio público. El
análisis de las canciones es ilustrativo (no sale de una grabación real) y la reproducción está
simulada; la canción completa se abre en Spotify o YouTube.

## Cómo ejecutarlo

Necesitas Node.js 20 o superior.

```bash
npm install
npm run web        # abre la app en el navegador (http://localhost:8081)
```

Otros comandos:

```bash
npm run typecheck  # comprueba los tipos de TypeScript
npm run build:web  # genera la versión web estática en dist/
```

## Estructura

```
src/
  app/                 Pantallas (Expo Router: cada archivo es una ruta)
    index.tsx          Inicio y búsqueda
    cancion/[id].tsx   Carpeta de la canción (letra, recursos, estructura, tonos, partitura…)
    recurso/[id].tsx   Ficha del recurso vocal: qué es, ejercicios, vídeos, fuentes
    recursos.tsx       Biblioteca de recursos vocales
  components/          Mapa de la canción, reproductor de YouTube, partitura, UI
  data/                Modelo de datos, canciones y recursos de ejemplo
  lib/                 Reloj de reproducción y utilidades musicales (transposición)
```

## Tecnología

- [Expo](https://expo.dev) + React Native + TypeScript: un solo código para web, iOS y Android.
- Expo Router para la navegación.
- [OpenSheetMusicDisplay](https://opensheetmusicdisplay.org) para dibujar partituras MusicXML.
- Reproductor oficial de YouTube embebido para los tutoriales.

## Próximos pasos

1. Análisis automático de cualquier canción (estructura, tonalidad, melodía y recursos vocales).
2. Base de datos (Supabase) en lugar de los datos de ejemplo.
3. Versión móvil (iOS y Android).
