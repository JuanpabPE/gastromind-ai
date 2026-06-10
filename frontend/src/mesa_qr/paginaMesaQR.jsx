import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../compartido/api/cliente";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function PaginaMesaQR() {
  const { sede, numero } = useParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState("cargando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function unirse() {
      // Verifica sesión
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // Guarda la URL para volver después del login
        localStorage.setItem("redirect_after_login", window.location.pathname);
        navigate("/login");
        return;
      }

      // Busca la mesa
      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      const sedeDecoded = decodeURIComponent(sede);

      const res = await fetch(
        `${API}/pedidos/mesa-por-ubicacion/${encodeURIComponent(sedeDecoded)}/${numero}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!res.ok) {
        setEstado("error");
        return;
      }
      const mesaData = await res.json();

      if (mesaData.estado !== "ocupada") {
        setEstado("mesa_libre");
        return;
      }

      // Se une al pedido
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("nombre, puntos_fidelidad")
        .eq("usuario_id", user.id)
        .single();

      await fetch(`${API}/pedidos/unirse/${mesaData.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: perfil?.nombre || "Cliente" }),
      });

      setEstado("unido");
      setMensaje(
        `¡Bienvenido, ${perfil?.nombre?.split(" ")[0]}! Tienes ${perfil?.puntos_fidelidad || 0} puntos acumulados.`,
      );
    }
    unirse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={estilos.pagina}>
      <div style={estilos.tarjeta}>
        <div style={estilos.logo}>🍽️</div>
        <h1 style={estilos.titulo}>Tanta</h1>

        {estado === "cargando" && (
          <p style={estilos.texto}>Conectando con tu mesa...</p>
        )}

        {estado === "error" && (
          <p style={{ ...estilos.texto, color: "#e53e3e" }}>
            No se encontró esta mesa. Verifica el QR.
          </p>
        )}

        {estado === "mesa_libre" && (
          <p style={{ ...estilos.texto, color: "#e53e3e" }}>
            Esta mesa aún no tiene un pedido abierto. Pídele al mozo que abra la
            mesa.
          </p>
        )}

        {estado === "unido" && (
          <>
            <div style={estilos.check}>✓</div>
            <p style={estilos.textoGrande}>¡Te uniste a la mesa {numero}!</p>
            <p style={estilos.texto}>{mensaje}</p>
            <p style={estilos.sede}>{decodeURIComponent(sede)}</p>

            <div style={estilos.acciones}>
              <button
                onClick={() => navigate("/menu")}
                style={estilos.btnPrimario}
              >
                Ver menú
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                style={estilos.btnSecundario}
              >
                Mi dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    backgroundColor: "#f5f0eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "2.5rem",
    maxWidth: "360px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },
  logo: { fontSize: "3rem", marginBottom: "8px" },
  titulo: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#1a1a1a",
    margin: "0 0 1.5rem",
  },
  check: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#f0fff4",
    color: "#48bb78",
    fontSize: "1.8rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
    fontWeight: "700",
  },
  textoGrande: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 8px",
  },
  texto: {
    fontSize: "0.9rem",
    color: "#666",
    lineHeight: "1.5",
    margin: "0 0 8px",
  },
  sede: { fontSize: "0.8rem", color: "#aaa", margin: "0 0 1.5rem" },
  acciones: { display: "flex", flexDirection: "column", gap: "10px" },
  btnPrimario: {
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#c8a96e",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  btnSecundario: {
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#f5f5f5",
    color: "#555",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
};
