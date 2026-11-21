-- Tabla donde se guardan las fichas automáticas de canciones (función song-analysis).
-- Se crea una sola vez: en Supabase, SQL Editor → New query → pega esto → Run.
create table if not exists public.song_analyses (
  deezer_id text primary key,
  title text not null,
  artist text not null,
  version int not null default 1,
  analysis jsonb not null,
  created_at timestamptz not null default now()
);

-- Solo la función (con la clave de servicio) puede leer y escribir. La web pasa siempre por la función.
alter table public.song_analyses enable row level security;
