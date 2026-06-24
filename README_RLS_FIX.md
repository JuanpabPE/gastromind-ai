# 🔐 RLS Fix: Permitir INSERT en Perfiles sin Autenticación

## 📋 Problema Actual

- ❌ RLS error: `new row violates row-level security policy for table "perfiles"`
- ❌ Login automático fallaba porque email no estaba confirmado
- ❌ `auth.uid()` era null durante el registro

## ✅ Solución: Nueva Política RLS

La nueva política **permite INSERT sin estar autenticado** durante el registro:

- ✅ `INSERT`: Permitido a CUALQUIERA (sin validar auth.uid)
- ✅ `SELECT`: Solo ver propio perfil (`auth.uid() = usuario_id`)
- ✅ `UPDATE`: Solo actualizar propio perfil
- ✅ `DELETE`: Solo eliminar propio perfil

## 🚀 Pasos para Ejecutar

### 1. Ir a Supabase Dashboard

```
https://app.supabase.com → Proyecto → SQL Editor
```

### 2. Ejecutar Script 1: Actualizar RLS

Copiar contenido de: `backend/sql/01_rls_perfiles_registro.sql`

Pegar en SQL Editor y ejecutar:

```sql
-- Script completo en 01_rls_perfiles_registro.sql
```

**Resultado esperado:**

```
DROP POLICY
CREATE POLICY
... (4 políticas creadas)
ALTER TABLE
```

### 3. Verificar en Supabase

Ir a: **Authentication** → **Policies** → Tabla "perfiles"

- Deberías ver 4 políticas:
  1. "Allow insert for registration" (INSERT)
  2. "Allow select own profile" (SELECT)
  3. "Allow update own profile" (UPDATE)
  4. "Allow delete own profile" (DELETE)

## 🔄 Flujo de Registro (Actualizado)

```
1. Frontend: PaginaRegister.jsx
   ↓
   Usuario ingresa email, contraseña, nombre
   ↓
   Guarda en sessionStorage (NO hace signUp aún)
   ↓
   Navega a /perfil/completar

2. Frontend: paginaPerfil.jsx
   ↓
   Usuario completa: alergias, enfermedades, preferencias
   ↓
   Click "Guardar Perfil"
   ↓
   usePerfil.js → guardarPerfil():

   a) Lee email/password/nombre de sessionStorage
   b) Crea cuenta: supabase.auth.signUp()  ← Crea usuario en Auth
   c) Obtiene usuario_id del signup
   d) Guarda perfil: INSERT into perfiles  ← RLS permite sin auth
   e) Limpia sessionStorage
   f) ✅ Registro completado
```

## ❌ Rollback (Si Necesitas Volver Atrás)

Ejecutar script: `backend/sql/02_rollback_rls.sql`

```sql
DROP POLICY IF EXISTS "Allow insert for registration" ON perfiles;
DROP POLICY IF EXISTS "Allow select own profile" ON perfiles;
... (más drops)
```

## 🧪 Prueba del Flujo

1. Abre: http://localhost:5173/register
2. Ingresa:
   - Email: `test@ejemplo.com`
   - Contraseña: `Test123!@#` (cumple validación)
   - Nombre: `Juan Pérez`
3. Click "Crear cuenta"
4. Deberías navegar a `/perfil/completar`
5. Completa:
   - Alergias (≥1)
   - Enfermedades (≥1)
   - Preferencias (≥1)
   - Objetivo calórico (1200-3500)
6. Click "Guardar Perfil"
7. ✅ Debería **guardar exitosamente** SIN error de RLS

## 📝 Cambios Realizados

### Frontend

- ✅ `usePerfil.js`: Removido login automático innecesario

### Backend SQL

- ✅ `01_rls_perfiles_registro.sql`: Nuevas políticas RLS
- ✅ `02_rollback_rls.sql`: Script de reversión

## ⚠️ Notas de Seguridad

- **Desarrollo**: La política actual es permisiva para facilitar testing
- **Producción**: Considera validaciones adicionales:
  - Limitar cantidad de registros por IP en tiempo
  - Validar estructura de datos en app layer
  - Considerar trigger que valide usuario_id válido

---

**¿Todo ejecutado?** Intenta registrarte nuevamente 🎉
