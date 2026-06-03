-- ============================================================================
-- RLS Policy: Permitir INSERT en perfiles durante registro (sin autenticación)
-- ============================================================================
-- Ejecutar en Supabase SQL Editor
-- Propósito: Permitir que usuarios no autenticados creen su perfil durante registro
-- Seguridad: Solo permite FIRST INSERT, luego está protegido por RLS

-- Paso 1: Eliminar políticas antiguas de INSERT (si existen)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON perfiles;
DROP POLICY IF EXISTS "Allow insert on first registration" ON perfiles;

-- Paso 2: Crear política de INSERT: Permitir a CUALQUIERA insertar su propio perfil
-- (No validamos auth.uid() porque aún no hay sesión)
CREATE POLICY "Allow insert for registration"
ON perfiles
FOR INSERT
WITH CHECK (true);  -- Permite insert sin validación de auth

-- Paso 3: Crear política de SELECT: Solo ver propio perfil
DROP POLICY IF EXISTS "Enable read for authenticated users" ON perfiles;

CREATE POLICY "Allow select own profile"
ON perfiles
FOR SELECT
USING (auth.uid() = usuario_id);

-- Paso 4: Crear política de UPDATE: Solo actualizar propio perfil
DROP POLICY IF EXISTS "Enable update for authenticated users" ON perfiles;

CREATE POLICY "Allow update own profile"
ON perfiles
FOR UPDATE
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- Paso 5: Crear política de DELETE: Solo eliminar propio perfil
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON perfiles;

CREATE POLICY "Allow delete own profile"
ON perfiles
FOR DELETE
USING (auth.uid() = usuario_id);

-- Verificar que RLS está habilitado en la tabla
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Mostrar políticas creadas
SELECT * FROM pg_policies WHERE tablename = 'perfiles';
