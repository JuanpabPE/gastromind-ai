import { useState } from "react";
import { supabase } from "../compartido/api/cliente";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useChat() {
  const [mensajes, setMensajes] = useState([
    {
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente nutricionista de Tanta 🍽️ ¿En qué te puedo ayudar hoy? Puedo recomendarte platos según tu perfil, explicarte el valor nutricional de cualquier preparación o alertarte sobre alérgenos.",
    },
  ]);
  const [cargando, setCargando] = useState(false);

  async function enviarMensaje(texto) {
    if (!texto.trim()) return;

    const nuevosMensajes = [...mensajes, { role: "user", content: texto }];
    setMensajes(nuevosMensajes);
    setCargando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${API}/chatbot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mensaje: texto,
          historial: mensajes.filter((m) => m.role !== "system"),
        }),
      });

      const data = await response.json();
      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.respuesta,
        },
      ]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Lo siento, tuve un problema para responder. ¿Puedes intentarlo de nuevo?",
        },
      ]);
    } finally {
      setCargando(false);
    }
  }

  function limpiarChat() {
    setMensajes([
      {
        role: "assistant",
        content: "¡Hola de nuevo! ¿En qué te puedo ayudar?",
      },
    ]);
  }

  return { mensajes, cargando, enviarMensaje, limpiarChat };
}
