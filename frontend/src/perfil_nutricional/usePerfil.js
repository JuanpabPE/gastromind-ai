import { useState } from "react";
import { supabase } from "../compartido/api/cliente";

export function usePerfil() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  async function guardarPerfil(datos) {
    setCargando(true);
    setError(null);

    // 1. Obtener datos de registro temporal
    const registroTemporal = JSON.parse(
      sessionStorage.getItem("registro_temporal") || "{}",
    );

    if (!registroTemporal.email || !registroTemporal.password) {
      setError(
        "Falta información de registro. Por favor completa el registro primero.",
      );
      setCargando(false);
      return false;
    }

    // 2. Llamar al endpoint del backend (NUEVO FLUJO)
    // El backend se encarga del signup + perfil
    try {
      const response = await fetch("http://localhost:8000/auth/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registroTemporal.email,
          password: registroTemporal.password,
          nombre: registroTemporal.nombre,
          fecha_nacimiento: datos.fecha_nacimiento,
          alergias: datos.alergias,
          intolerancias: datos.intolerancias,
          enfermedades: datos.enfermedades,
          preferencias: datos.preferencias,
          objetivo_calorico: parseInt(datos.objetivo_calorico),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const mensajeError = errorData.detail || "Error en el registro";

        console.error("❌ ERROR DEL BACKEND:", errorData);
        console.log("📤 DATOS ENVIADOS:", {
          email: registroTemporal.email,
          password: registroTemporal.password,
          nombre: registroTemporal.nombre,
          fecha_nacimiento: datos.fecha_nacimiento,
          alergias: datos.alergias,
          intolerancias: datos.intolerancias,
          enfermedades: datos.enfermedades,
          preferencias: datos.preferencias,
          objetivo_calorico: parseInt(datos.objetivo_calorico),
        });

        if (response.status === 429) {
          // Guardar cooldown local para evitar reintentos inmediatos
          const cooldownMs = 60 * 60 * 1000; // 1 hora
          const until = Date.now() + cooldownMs;
          try {
            localStorage.setItem("registro_cooldown_until", String(until));
          } catch (e) {
            console.warn("No se pudo guardar cooldown en localStorage", e);
          }
          setError("Demasiados intentos de registro o verificación. Intenta de nuevo en unos minutos.");
        } else {
          setError(mensajeError);
        }

        setCargando(false);
        return false;
      }

      const resultado = await response.json();

      // 3. Limpiar datos temporales
      sessionStorage.removeItem("registro_temporal");

      return {
        ok: true,
        requiereVerificacion: Boolean(resultado.requiere_verificacion),
        mensaje: resultado.mensaje || "Registro completado.",
      };
    } catch (err) {
      setError(
        err.message || "Error al comunicarse con el servidor de registro.",
      );
      setCargando(false);
      return false;
    }
  }

  async function obtenerPerfil() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.id) {
      return null;
    }

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
