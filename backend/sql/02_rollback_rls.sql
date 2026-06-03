-- ============================================================================
-- Script: Rollback (Restaurar políticas anteriores)
-- ============================================================================
-- Use este script si necesita volver atrás

-- Eliminar todas las políticas de perfiles
DROP POLICY IF EXISTS "Allow insert for registration" ON perfiles;
DROP POLICY IF EXISTS "Allow select own profile" ON perfiles;
DROP POLICY IF EXISTS "Allow update own profile" ON perfiles;
DROP POLICY IF EXISTS "Allow delete own profile" ON perfiles;

-- Opcionalmente, deshabilitar RLS por completo (NO RECOMENDADO en producción)
-- ALTER TABLE perfiles DISABLE ROW LEVEL SECURITY;

-- Verificar que se eliminaron
SELECT * FROM pg_policies WHERE tablename = 'perfiles';
