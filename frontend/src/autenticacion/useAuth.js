import { useState } from "react";
import { supabase } from "../compartido/api/cliente";

export function useAuth() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  async function register({ email, password, nombre }) {
    setCargando(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });
    setCargando(false);
    if (error) {
      setError(error.message);
      return null;
    }
    return data;
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

  return { register, login, logout, cargando, error };
}
