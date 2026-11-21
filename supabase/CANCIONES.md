# Fichas automáticas de canciones (Supabase + Claude)

La búsqueda de cualquier canción funciona ya, sin nada más: usa el catálogo gratuito de Deezer.
La web también calcula la tonalidad y el tempo escuchando el fragmento de 30 segundos.

La parte que prepara la IA (estructura, cambios de tono, tesitura, recursos vocales) necesita la
función `functions/song-analysis`. Usa **el mismo proyecto de Supabase y la misma clave de Claude**
que el chat de Abi, así que si ya hiciste aquellos pasos, solo faltan los de abajo.

La clave de Claude **nunca** va en la web ni en este repositorio: vive en Supabase como el secreto
`ANTHROPIC_API_KEY`.

## Puesta en marcha (una sola vez)

1. **Tabla para guardar las fichas.** En Supabase: *SQL Editor → New query*. Pega el contenido de
   `sql/song_analyses.sql` y pulsa *Run*. Así cada canción se analiza una sola vez.
2. **Función.** *Edge Functions → Deploy a new function → Via editor*. Nombre: `song-analysis`.
   Pega el contenido de `functions/song-analysis/index.ts` y pulsa *Deploy*.
3. **Acceso público.** En la función, pestaña *Details*, desactiva *Enforce JWT verification*
   (la web no inicia sesión). Guarda.
4. **Conectar la web.** Copia la URL de la función
   (`https://<tu-proyecto>.supabase.co/functions/v1/song-analysis`) y ponla en `SONG_ANALYSIS_URL`
   de `src/lib/songCatalog.ts`, o compila con `EXPO_PUBLIC_SONG_ANALYSIS_URL=<url>`.

## Qué cuesta

- Deezer, el cálculo del audio y los enlaces a Spotify, YouTube, Genius y Musixmatch: gratis.
- La IA (Claude Opus 5.5 con hasta 3 búsquedas web): unos céntimos la primera vez que alguien
  abre una canción. Después sale guardada y no vuelve a costar.

## Protecciones

- Solo responde a la web publicada y a `localhost`.
- Máximo 3 fichas nuevas por minuto y persona, y 200 al día en total. Las guardadas no cuentan.
- La protección de verdad es el **límite de gasto** de la consola de Claude: ponlo bajo.

## Limitaciones

- Todo lo calculado es una estimación y la web lo dice. La tonalidad del audio solo ve 30 segundos.
- La letra no se copia (derechos de autor): se enlaza a Genius y Musixmatch.
- Algunas canciones de Deezer no tienen fragmento; entonces la tonalidad y el tempo los da la IA.
