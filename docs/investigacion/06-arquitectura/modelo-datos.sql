-- Tarea 6 — Modelo de datos mínimo (PostgreSQL)
-- Proyecto: Reto Saber · Cinco Puntos
-- Nota: complementa supabase/progreso.sql (ya en producción para el demo).
-- Convención: todas las tablas tienen created_at/updated_at vía triggers estándar.

-- ===================== 1) Catálogos =====================

CREATE TABLE IF NOT EXISTS examenes (
  id            SERIAL PRIMARY KEY,
  codigo        TEXT NOT NULL UNIQUE,          -- SABER_11 | SABER_TYT | SABER_PRO
  nombre        TEXT NOT NULL,                 -- 'Saber 11.°', 'Saber TyT', 'Saber Pro'
  descripcion   TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS modulos (
  id           SERIAL PRIMARY KEY,
  examen_id    INT NOT NULL REFERENCES examenes(id) ON DELETE CASCADE,
  codigo       TEXT NOT NULL,                  -- LC | MAT | SOC | CN | ING | CE | RC | CC | ESPECIFICO
  nombre       TEXT NOT NULL,                  -- 'Lectura Critica', 'Matematicas', ...
  orden        INT DEFAULT 0,
  UNIQUE (examen_id, codigo)
);

CREATE TABLE IF NOT EXISTS competencias (
  id          SERIAL PRIMARY KEY,
  modulo_id   INT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,                   -- 'Interpretación y representación', ...
  descripcion TEXT DEFAULT ''                  -- evidencias y acciones mentales (Tarea 3)
);

-- ===================== 2) Fuentes y licencias =====================

CREATE TABLE IF NOT EXISTS fuentes (
  id          SERIAL PRIMARY KEY,
  titulo      TEXT NOT NULL,
  tipo        TEXT NOT NULL,                   -- cuadernillo | marco | guia | infografia | video | pagina
  examen_id   INT REFERENCES examenes(id),
  modulo_id   INT REFERENCES modulos(id),
  url         TEXT NOT NULL,
  anno        TEXT DEFAULT '',
  descripcion TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS licencias (
  id          SERIAL PRIMARY KEY,
  fuente_id   INT NOT NULL REFERENCES fuentes(id) ON DELETE CASCADE,
  texto       TEXT NOT NULL,                   -- '© ICFES - todos los derechos reservados...'
  aviso       TEXT NOT NULL                    -- texto de atribución exacto mostrado en la app
);

-- ===================== 3) Banco de preguntas =====================

CREATE TABLE IF NOT EXISTS preguntas (
  id                    TEXT PRIMARY KEY,      -- 'saber11-lectura-001'
  examen_id             INT NOT NULL REFERENCES examenes(id),
  modulo_id             INT NOT NULL REFERENCES modulos(id),
  competencia_id        INT REFERENCES competencias(id),
  fuente_id             INT REFERENCES fuentes(id),
  fuente_tipo           TEXT NOT NULL DEFAULT 'Generada por la aplicación',  -- 'ICFES' | 'Generada por la aplicación'
  tipo_pregunta         TEXT NOT NULL DEFAULT 'opcion_multiple_unica',
  enunciado             TEXT NOT NULL,
  texto_apoyo           TEXT DEFAULT '',
  recursos_requeridos   TEXT[] DEFAULT '{}',   -- ids de imágenes/gráficos en el almacenamiento
  respuesta_correcta    CHAR(1) NOT NULL,
  explicacion           TEXT DEFAULT '',
  explicacion_generada  BOOLEAN DEFAULT FALSE, -- true = explicación creada por la app
  dificultad            TEXT CHECK (dificultad IN ('baja','media','alta')),
  anno_aplicacion       TEXT DEFAULT '',
  cuadernillo           TEXT DEFAULT '',
  tema                  TEXT DEFAULT '',
  subtema               TEXT DEFAULT '',
  idioma                TEXT NOT NULL DEFAULT 'es',  -- 'en' para Inglés
  estado                TEXT NOT NULL DEFAULT 'borrador',  -- borrador | revision | publicado
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opciones (
  id            SERIAL PRIMARY KEY,
  pregunta_id   TEXT NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
  letra         CHAR(1) NOT NULL,
  texto         TEXT NOT NULL,
  UNIQUE (pregunta_id, letra)
);

-- ===================== 4) Intentos y resultados =====================

CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID PRIMARY KEY,                -- auth.users.id de Supabase
  nombre      TEXT NOT NULL,
  correo      TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS intentos (
  id           BIGSERIAL PRIMARY KEY,
  usuario_id   UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo_id    INT NOT NULL REFERENCES modulos(id),
  modo         TEXT NOT NULL,                  -- practica | diagnostico | simulacro | repaso
  iniciado_en  TIMESTAMPTZ DEFAULT now(),
  finalizado_en TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS respuestas_usuario (
  id            BIGSERIAL PRIMARY KEY,
  intento_id    BIGINT NOT NULL REFERENCES intentos(id) ON DELETE CASCADE,
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  pregunta_id   TEXT NOT NULL REFERENCES preguntas(id),
  letra_elegida CHAR(1) NOT NULL,
  correcta      BOOLEAN NOT NULL,
  ms_respuesta  INT,                           -- tiempo de respuesta (analítica)
  respondida_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS simulacros (
  id          BIGSERIAL PRIMARY KEY,
  usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  examen_id   INT NOT NULL REFERENCES examenes(id),
  alcance     TEXT NOT NULL,                   -- modulo | completo
  duracion_seg INT,
  iniciado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resultados (
  id            BIGSERIAL PRIMARY KEY,
  simulacro_id  BIGINT REFERENCES simulacros(id) ON DELETE CASCADE,
  intento_id    BIGINT REFERENCES intentos(id) ON DELETE CASCADE,
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  puntaje       NUMERIC(6,2),
  detalle_json  JSONB NOT NULL DEFAULT '{}',   -- precisión por módulo, competencia, tiempo medio
  creado_en     TIMESTAMPTZ DEFAULT now()
);

-- ===================== 5) Planes, contenidos, analítica =====================

CREATE TABLE IF NOT EXISTS planes_estudio (
  id            BIGSERIAL PRIMARY KEY,
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  examen_id     INT NOT NULL REFERENCES examenes(id),
  fecha_meta    DATE,
  plan_json     JSONB NOT NULL DEFAULT '{}',   -- objetivos, horario semanal, módulos priorizados
  activo        BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS contenidos (
  id          SERIAL PRIMARY KEY,
  modulo_id   INT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL,                   -- resumen | concepto | estrategia | glosario
  titulo      TEXT NOT NULL,
  cuerpo      TEXT NOT NULL,                   -- Markdown; basado en marcos de referencia
  fuente_id   INT REFERENCES fuentes(id),
  generado    BOOLEAN DEFAULT FALSE            -- true = creado por la app (marcado en UI)
);

CREATE TABLE IF NOT EXISTS eventos (
  id            BIGSERIAL PRIMARY KEY,
  usuario_id    UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo          TEXT NOT NULL,                 -- practica | simulacro | error | vista_pantalla | ...
  datos_json    JSONB NOT NULL DEFAULT '{}',
  creado_en     TIMESTAMPTZ DEFAULT now()
);

-- ===================== 6) Índices sugeridos =====================

CREATE INDEX IF NOT EXISTS idx_preguntas_modulo  ON preguntas(modulo_id, estado);
CREATE INDEX IF NOT EXISTS idx_respuestas_usr    ON respuestas_usuario(usuario_id, respondida_en DESC);
CREATE INDEX IF NOT EXISTS idx_respuestas_preg   ON respuestas_usuario(pregunta_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_resp_intento ON respuestas_usuario(intento_id, pregunta_id);
