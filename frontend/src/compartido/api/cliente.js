import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
const originalGetSession = supabase.auth.getSession.bind(supabase.auth);

let authCleanupDone = false;

async function limpiarSesionInvalida(error) {
  if (authCleanupDone) return;
  authCleanupDone = true;
  const mensaje = String(error?.message || error || "").toLowerCase();
  if (
    !mensaje.includes("refresh token") &&
    !mensaje.includes("invalid refresh")
  ) {
    return;
  }
  console.warn("Auth cleanup: token inválido detectado, limpiando storage...");
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.warn("No se pudo limpiar storage:", e);
  }
}

supabase.auth.getUser = async (...args) => {
  try {
    return await originalGetUser(...args);
  } catch (error) {
    await limpiarSesionInvalida(error);
    return { data: { user: null }, error: null };
  }
};

supabase.auth.getSession = async (...args) => {
  try {
    return await originalGetSession(...args);
  } catch (error) {
    await limpiarSesionInvalida(error);
    return { data: { session: null }, error: null };
  }
};
