-- =====================================================================
-- Reto Saber · BORRADOR de esquema inicial (Módulo 1: registro de datos)
-- Motor objetivo: PostgreSQL 15 o superior.
-- ESTADO: propuesta para revisar con Danny y el equipo. No es una
-- decisión confirmada y NO se ha ejecutado. No usar con datos reales.
--
-- Criterios tomados de las notas de la "Reunión Danny":
--   * Esquemas separados por área (core, auditoria, reportes).
--   * La BD solo guarda datos: sin triggers ni procedimientos con
--     reglas de negocio; la lógica vive en la aplicación.
--   * Módulos que se prenden y apagan por organización.
--   * Separación de datos y auditoría por cliente (organizacion_id).
--   * Datos mínimos de personas (apodo, grado, correo). Nada de
--     documento de identidad, dirección ni fotos.
--   * Sin pagos: no existe ninguna tabla de planes, precios ni cobros.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS core;       -- organizaciones, módulos, usuarios
CREATE SCHEMA IF NOT EXISTS auditoria;  -- registro de eventos por cliente
CREATE SCHEMA IF NOT EXISTS reportes;   -- vistas para exportar a Excel/CSV

-- ---------------------------------------------------------------------
-- Organización (el "cliente" o espacio de datos): puede ser la propia
-- empresa, un colegio, un grupo piloto, etc. Por confirmar con Danny.
-- ---------------------------------------------------------------------
CREATE TABLE core.organizacion (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      text        NOT NULL,
    tipo        text        NOT NULL DEFAULT 'grupo'
                CHECK (tipo IN ('empresa', 'colegio', 'institucion', 'grupo')),
    activa      boolean     NOT NULL DEFAULT true,
    creada_en   timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Catálogo de módulos y su orden de desarrollo.
-- ---------------------------------------------------------------------
CREATE TABLE core.modulo (
    codigo       text PRIMARY KEY,
    nombre       text NOT NULL,
    descripcion  text,
    orden        integer NOT NULL UNIQUE
);

INSERT INTO core.modulo (codigo, nombre, descripcion, orden) VALUES
    ('registro',        'Registro de datos',   'Organizaciones, usuarios y consentimientos', 1),
    ('banco_preguntas', 'Banco de preguntas',  'Preguntas originales con explicación y doble revisión', 2),
    ('practica',        'Práctica y retos',    'Sesiones cortas, repaso y racha', 3),
    ('progreso',        'Progreso',            'Avance por área y repaso de errores', 4),
    ('simulacro',       'Simulacro',           'Versión cronometrada tipo Pre-ICFES', 5);
-- Un módulo comercial (planes/cobros) queda FUERA hasta autorización expresa.

-- Qué módulos tiene activos cada organización (prender / apagar).
CREATE TABLE core.organizacion_modulo (
    organizacion_id uuid    NOT NULL REFERENCES core.organizacion (id),
    modulo_codigo   text    NOT NULL REFERENCES core.modulo (codigo),
    activo          boolean NOT NULL DEFAULT false,
    cambiado_en     timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (organizacion_id, modulo_codigo)
);

-- ---------------------------------------------------------------------
-- Usuarios: solo datos mínimos.
-- ---------------------------------------------------------------------
CREATE TABLE core.usuario (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL REFERENCES core.organizacion (id),
    apodo           text NOT NULL,
    grado           text,                       -- ej. '10.°'
    correo          text,                       -- opcional; si es menor, ver consentimiento
    rol             text NOT NULL DEFAULT 'estudiante'
                    CHECK (rol IN ('estudiante', 'docente', 'admin')),
    activo          boolean     NOT NULL DEFAULT true,
    creado_en       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX usuario_correo_por_org
    ON core.usuario (organizacion_id, lower(correo)) WHERE correo IS NOT NULL;
CREATE INDEX usuario_org ON core.usuario (organizacion_id);

-- Autorización del acudiente para menores de 18 (Ley 1581 · Ley 1098).
CREATE TABLE core.consentimiento (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id  uuid NOT NULL REFERENCES core.organizacion (id),
    usuario_id       uuid NOT NULL REFERENCES core.usuario (id),
    correo_acudiente text NOT NULL,
    version_politica text NOT NULL,             -- versión de la política aceptada
    aceptado_en      timestamptz NOT NULL DEFAULT now(),
    revocado_en      timestamptz
);
CREATE INDEX consentimiento_org ON core.consentimiento (organizacion_id);

-- ---------------------------------------------------------------------
-- Auditoría separada por cliente: solo se agregan filas.
-- ---------------------------------------------------------------------
CREATE TABLE auditoria.evento (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organizacion_id uuid        NOT NULL,
    usuario_id      uuid,
    accion          text        NOT NULL,       -- ej. 'crear', 'modificar', 'borrar'
    entidad         text        NOT NULL,       -- ej. 'usuario'
    entidad_id      text,
    detalle         jsonb,                      -- sin datos personales sensibles
    ocurrido_en     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX evento_org_fecha ON auditoria.evento (organizacion_id, ocurrido_en);

-- ---------------------------------------------------------------------
-- Aislamiento por cliente con Row Level Security (propuesta a discutir:
-- alternativa = un esquema por cliente). La aplicación fija, en cada
-- conexión:  SET app.organizacion_id = '<uuid>';
-- Si no se fija, no se ve ninguna fila.
-- ---------------------------------------------------------------------
ALTER TABLE core.usuario              ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.usuario              FORCE  ROW LEVEL SECURITY;
ALTER TABLE core.consentimiento       ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.consentimiento       FORCE  ROW LEVEL SECURITY;
ALTER TABLE core.organizacion_modulo  ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.organizacion_modulo  FORCE  ROW LEVEL SECURITY;
ALTER TABLE auditoria.evento          ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria.evento          FORCE  ROW LEVEL SECURITY;

CREATE POLICY aislamiento ON core.usuario
    USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);
CREATE POLICY aislamiento ON core.consentimiento
    USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);
CREATE POLICY aislamiento ON core.organizacion_modulo
    USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);
CREATE POLICY aislamiento ON auditoria.evento
    USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

-- ---------------------------------------------------------------------
-- Reporte de ejemplo para exportar a Excel (solo cifras, sin datos
-- personales). Respeta el aislamiento por cliente (PostgreSQL 15+).
-- ---------------------------------------------------------------------
CREATE VIEW reportes.v_usuarios_por_grado
    WITH (security_invoker = true) AS
SELECT organizacion_id,
       coalesce(grado, 'sin dato') AS grado,
       count(*)                    AS usuarios
FROM   core.usuario
WHERE  activo
GROUP  BY organizacion_id, coalesce(grado, 'sin dato');

-- ---------------------------------------------------------------------
-- Rol de la aplicación (ejemplo, no ejecutar tal cual): NO debe ser el
-- dueño de las tablas, para que RLS aplique. La auditoría no se edita.
--   CREATE ROLE app_reto_saber LOGIN PASSWORD '<definir fuera del repositorio>';
--   GRANT USAGE ON SCHEMA core, auditoria, reportes TO app_reto_saber;
--   GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA core TO app_reto_saber;
--   GRANT SELECT, INSERT ON auditoria.evento TO app_reto_saber;  -- sin UPDATE/DELETE
--   GRANT SELECT ON reportes.v_usuarios_por_grado TO app_reto_saber;
-- ---------------------------------------------------------------------
