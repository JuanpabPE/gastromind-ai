-- ============================================================================
-- Script: Limpiar usuario para testing
-- ============================================================================
-- Ejecutar en Supabase SQL Editor

-- Paso 1: Encontrar el usuario_id del email
SELECT id, email FROM auth.users WHERE email = 'jojonavaney@gmail.com';

-- Paso 2: Eliminar el perfil (reemplazar UUID con el ID encontrado)
DELETE FROM perfiles WHERE usuario_id = 'REEMPLAZA_CON_EL_UUID_DEL_PASO_1';

-- Nota: Para eliminar completamente de Supabase Auth, necesitas:
-- 1. Ir a Supabase Dashboard
-- 2. Authentication → Users
-- 3. Buscar jojonavaney@gmail.com
-- 4. Click en ... → Delete user
