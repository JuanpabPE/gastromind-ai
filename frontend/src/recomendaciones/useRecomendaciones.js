import { useState, useEffect } from "react";
import { supabase } from "../compartido/api/cliente";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useRecomendaciones() {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch(`${API}/recomendaciones/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setRecomendaciones(data.platos || []);
      } catch (e) {
        setError("No se pudieron cargar las recomendaciones");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return { recomendaciones, cargando, error };
}
