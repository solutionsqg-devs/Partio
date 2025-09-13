-- Script de inicialización para PostgreSQL
-- Crea base de datos de testing y configuraciones adicionales

-- Crear base de datos para testing
CREATE DATABASE partio_test;

-- Crear usuario para testing (si no existe)
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'partio_test') THEN
      CREATE USER partio_test WITH PASSWORD 'partio_test123';
   END IF;
END
$$;

-- Otorgar permisos al usuario de test
GRANT ALL PRIVILEGES ON DATABASE partio_test TO partio_test;

-- Conectar a la base de datos de test y otorgar permisos de schema
\c partio_test;
GRANT ALL ON SCHEMA public TO partio_test;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO partio_test;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO partio_test;

-- Volver a la base de datos principal
\c partio_dev;

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar timezone
SET timezone = 'UTC';

-- Crear índices adicionales para performance (se ejecutarán después de las migraciones)
-- Estos se pueden mover a migraciones de Prisma si es necesario
