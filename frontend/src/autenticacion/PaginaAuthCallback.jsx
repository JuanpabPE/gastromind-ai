import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../compartido/api/cliente";

export default function PaginaAuthCallback() {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("Procesando verificación...");

  useEffect(() => {
    async function procesar() {
      try {
        // Para procesar el link de verificación/redirección de Supabase
        if (typeof supabase.auth.getSessionFromUrl === "function") {
          const { data, error } = await supabase.auth.getSessionFromUrl();
          if (error) throw error;
          if (data?.session) {
            setMensaje("Verificación completada. Redirigiendo...");
            setTimeout(() => navigate("/login", { replace: true }), 800);
            return;
          }
        }

        // Fallback: intenta leer sesión normal
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          setMensaje("Verificación completada. Redirigiendo...");
          setTimeout(() => navigate("/login", { replace: true }), 800);
          return;
        }

        setMensaje("Si tu correo fue verificado, puedes iniciar sesión ahora.");
        setTimeout(() => navigate("/login", { replace: true }), 1800);
      } catch (error) {
        console.warn("Error en callback de auth:", error);
        setMensaje("No se pudo procesar la verificación. Volviendo al login...");
        setTimeout(() => navigate("/login", { replace: true }), 1800);
      }
    }

    procesar();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #F5F0E8 0%, #EAE1D5 100%)",
        fontFamily:
          "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#8B2E3B",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          padding: "2rem 2.5rem",
          borderRadius: "18px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
          maxWidth: "520px",
        }}
      >
        <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.5rem" }}>
          Verificación de correo
        </h1>
        <p style={{ margin: 0, color: "#555", lineHeight: 1.5 }}>{mensaje}</p>
      </div>
    </div>
  );
}
