import { useState, useEffect } from "react";
import { supabase } from "../compartido/api/cliente";

export default function TarjetaPuntos() {
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    async function cargar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("perfiles")
        .select("nombre, puntos_fidelidad, nivel")
        .eq("usuario_id", user.id)
        .single();
      setPerfil(data);
    }
    cargar();
  }, []);

  if (!perfil) return null;

  const puntos = perfil.puntos_fidelidad || 0;
  const nivel = puntos >= 500 ? "Oro" : puntos >= 200 ? "Plata" : "Bronce";
  const colores = { Bronce: "#cd7f32", Plata: "#aaa", Oro: "#c8a96e" };
  const puntosParaSiguiente =
    nivel === "Bronce" ? 200 : nivel === "Plata" ? 500 : 1000;
  const progreso = Math.min((puntos / puntosParaSiguiente) * 100, 100);

  return (
    <div style={estilos.tarjeta}>
      <div style={estilos.header}>
        <div>
          <p style={estilos.saludo}>Hola, {perfil.nombre?.split(" ")[0]} 👋</p>
          <p style={estilos.subtitulo}>Programa de fidelización Tanta</p>
        </div>
        <div style={{ ...estilos.badge, backgroundColor: colores[nivel] }}>
          {nivel === "Oro" ? "🥇" : nivel === "Plata" ? "🥈" : "🥉"} {nivel}
        </div>
      </div>

      <div style={estilos.puntosContenedor}>
        <span style={estilos.puntosNum}>{puntos}</span>
        <span style={estilos.puntosLabel}>puntos</span>
      </div>

      <div style={estilos.barraContenedor}>
        <div
          style={{
            ...estilos.barraProgreso,
            width: `${progreso}%`,
            backgroundColor: colores[nivel],
          }}
        />
      </div>
      <p style={estilos.meta}>
        {puntos >= 1000
          ? "🏆 ¡Nivel máximo alcanzado!"
          : `${puntosParaSiguiente - puntos} puntos para nivel ${nivel === "Bronce" ? "Plata" : "Oro"}`}
      </p>

      <div style={estilos.beneficios}>
        <p style={estilos.beneficiosTitulo}>Cómo ganar puntos</p>
        <div style={estilos.beneficioItem}>
          🍽️ <span>+10 puntos por cada plato registrado</span>
        </div>
        <div style={estilos.beneficioItem}>
          🥗 <span>+20 puntos por elegir platos saludables</span>
        </div>
        <div style={estilos.beneficioItem}>
          📅 <span>+50 puntos por visita semanal</span>
        </div>
      </div>
    </div>
  );
}

const estilos = {
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginBottom: "1.5rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  saludo: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 4px",
  },
  subtitulo: { fontSize: "0.8rem", color: "#888", margin: 0 },
  badge: {
    padding: "6px 14px",
    borderRadius: "20px",
    color: "#fff",
    fontWeight: "700",
    fontSize: "0.85rem",
  },
  puntosContenedor: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "12px",
  },
  puntosNum: {
    fontSize: "3rem",
    fontWeight: "800",
    color: "#c8a96e",
    lineHeight: 1,
  },
  puntosLabel: { fontSize: "1rem", color: "#888" },
  barraContenedor: {
    height: "8px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "6px",
  },
  barraProgreso: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.5s",
  },
  meta: { fontSize: "0.78rem", color: "#888", margin: "0 0 1rem" },
  beneficios: { borderTop: "1px solid #f0f0f0", paddingTop: "1rem" },
  beneficiosTitulo: {
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#444",
    marginBottom: "8px",
    marginTop: 0,
  },
  beneficioItem: {
    display: "flex",
    gap: "8px",
    fontSize: "0.82rem",
    color: "#666",
    marginBottom: "6px",
  },
};
