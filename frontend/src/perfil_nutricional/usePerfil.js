import { useState } from "react";
import { supabase } from "../compartido/api/cliente";

export function usePerfil() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  async function guardarPerfil(datos) {
    setCargando(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("perfiles").upsert(
      {
        usuario_id: user.id,
        nombre: datos.nombre,
        fecha_nacimiento: datos.fecha_nacimiento,
        alergias: datos.alergias,
        intolerancias: datos.intolerancias,
        enfermedades: datos.enfermedades,
        preferencias: datos.preferencias,
        objetivo_calorico: parseInt(datos.objetivo_calorico),
        actualizado_en: new Date().toISOString(),
      },
      { onConflict: "usuario_id" },
    );

    setCargando(false);
    if (error) {
      setError(error.message);
      return false;
    }
    return true;
  }

  async function obtenerPerfil() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("usuario_id", user.id)
      .single();

    if (error) return null;
    return data;
  }

  return { guardarPerfil, obtenerPerfil, cargando, error };
}
