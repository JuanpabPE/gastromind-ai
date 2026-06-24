-- Script para limpiar usuarios de prueba de Supabase
-- ⚠️ ADVERTENCIA: Este script elimina PERMANENTEMENTE todos los usuarios creados durante testing

-- 1. Obtener IDs de usuarios con emails de prueba
-- (esto te ayuda a verificar antes de eliminar)
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%@gmail.com' 
  OR email LIKE '%test%' 
  OR email LIKE '%prueba%'
ORDER BY created_at DESC;

-- 2. EJECUTAR SOLO SI QUIERES LIMPIAR:
-- Eliminar perfiles asociados a esos usuarios
DELETE FROM perfiles 
WHERE usuario_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE 'jojonavaney%@gmail.com' 
    
);

-- 3. Luego eliminar los usuarios de auth
-- ⚠️ CUIDADO: Esto es irreversible
DELETE FROM auth.users 
WHERE email LIKE '%@gmail.com' 
  OR email LIKE '%test%' 
  OR email LIKE '%prueba%';

-- 4. Verificar que quedó limpio
SELECT COUNT(*) as usuarios_restantes FROM auth.users;
SELECT COUNT(*) as perfiles_restantes FROM perfiles;
