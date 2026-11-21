# El cerebro de Abi (Supabase + Claude)

Abi responde preguntas gracias a la función `functions/abi-chat`, que se ejecuta en Supabase y
llama a la API de Claude (modelo `claude-haiku-5-5`, el más económico).

La clave de Claude **nunca** va en la web ni en este repositorio: se guarda en Supabase como
secreto con el nombre `ANTHROPIC_API_KEY`.

## Puesta en marcha (una sola vez)

1. **Clave de Claude.** En https://platform.claude.com: añade saldo en *Billing*, pon un límite
   de gasto mensual en *Limits* y crea una clave en *API keys*. Cópiala; no la pegues en ningún chat.
2. **Proyecto de Supabase.** En https://supabase.com crea una cuenta y un proyecto (plan gratuito).
3. **Secreto.** En el proyecto: *Edge Functions → Secrets → Add new secret*.
   Nombre `ANTHROPIC_API_KEY`, valor: la clave del paso 1.
4. **Función.** *Edge Functions → Deploy a new function → Via editor*. Nombre: `abi-chat`.
   Pega el contenido de `functions/abi-chat/index.ts` y pulsa *Deploy*.
5. **Acceso público.** En la función, pestaña *Details*, desactiva *Enforce JWT verification*
   (la web no inicia sesión). Guarda.
6. **Conectar la web.** Copia la URL de la función
   (`https://<tu-proyecto>.supabase.co/functions/v1/abi-chat`) y ponla en `ABI_URL`
   de `src/lib/abi.ts`, o compila con `EXPO_PUBLIC_ABI_URL=<url>`.

## Protecciones contra abusos

- Solo responde a la web publicada y a `localhost` (lista `ALLOWED_ORIGINS`).
- Máximo 8 preguntas por minuto por persona, mensajes de hasta 800 caracteres y 12 de historial.
- Respuestas cortas (`max_tokens` 1024, esfuerzo bajo).
- La protección de verdad es el **límite de gasto** de la consola de Claude: ponlo bajo (por ejemplo 5 $).
