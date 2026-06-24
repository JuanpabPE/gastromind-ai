import { useState } from "react";
import { supabase } from "../compartido/api/cliente";

export function useAuth() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  async function register({ email, password, nombre }) {
    setCargando(true);
    setError(null);

    // Solo guardar datos temporalmente, NO registrar en Supabase aún
    sessionStorage.setItem(
      "registro_temporal",
      JSON.stringify({
        email,
        password,
        nombre,
        timestamp: new Date().toISOString(),
      }),
    );

    setCargando(false);
    // Retornar datos para que navegue a perfil
    return { user: { id: "temp", email } };
  }

  async function finalizarRegistro({ email, password, nombre }) {
    setCargando(true);
    setError(null);

    // Ahora sí, registrar en Supabase
    const { data: signupData, error: signupError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: { data: { nombre } },
      },
    );

    if (signupError) {
      setError(signupError.message);
      setCargando(false);
      return null;
    }

    setCargando(false);
    return signupData;
  }

  async function login({ email, password }) {
    setCargando(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setCargando(false);
    if (error) {
      setError(error.message);
      return null;
    }
    return data;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return { register, finalizarRegistro, login, logout, cargando, error };
}
