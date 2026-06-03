import { useRecomendaciones } from "./useRecomendaciones";
import TarjetaRecomendacion from "./TarjetaRecomendacion";

export default function PanelRecomendaciones({ onVerFicha }) {
  const { recomendaciones, cargando, error } = useRecomendaciones();

  if (cargando)
    return (
      <div style={estilos.contenedor}>
        <p style={{ color: "#888", fontSize: "0.9rem" }}>
          Calculando recomendaciones...
        </p>
      </div>
    );

  if (error || recomendaciones.length === 0) return null;

  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}>Para ti</h2>
      <p style={estilos.subtitulo}>
        Basado en tu perfil de salud, preferencias e historial
      </p>
      <div style={estilos.lista}>
        {recomendaciones.map((plato, i) => (
          <TarjetaRecomendacion
            key={`${plato.id}-${i}`}
            plato={plato}
            posicion={i + 1}
            onClick={onVerFicha}
          />
        ))}
      </div>
    </div>
  );
}

const estilos = {
  contenedor: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginBottom: "1.5rem",
  },
  titulo: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 4px",
  },
  subtitulo: { fontSize: "0.82rem", color: "#888", margin: "0 0 1.2rem" },
  lista: { display: "flex", flexDirection: "column", gap: "10px" },
};
