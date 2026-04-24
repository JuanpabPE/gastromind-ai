import { useRecomendaciones } from "./useRecomendaciones";

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

  if (error) return null;

  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}>✨ Recomendados para ti</h2>
      <p style={estilos.subtitulo}>
        Basado en tu perfil de salud y preferencias
      </p>

      <div style={estilos.lista}>
        {recomendaciones.map((plato, i) => (
          <div
            key={plato.id}
            style={estilos.item}
            onClick={() => onVerFicha && onVerFicha(plato)}
          >
            <div style={estilos.numero}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <p style={estilos.nombre}>{plato.nombre}</p>
              <p style={estilos.info}>
                {plato.calorias} kcal · S/. {plato.precio}
              </p>
            </div>
            <div style={estilos.score}>
              <span style={estilos.scoreNum}>
                {Math.min(plato.score_recomendacion, 100).toFixed(0)}
              </span>
              <span style={estilos.scoreLbl}>match</span>
            </div>
          </div>
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
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "10px",
    backgroundColor: "#fdfcfa",
    border: "1px solid #f0ede8",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  numero: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#c8a96e",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    fontWeight: "700",
    flexShrink: 0,
  },
  nombre: {
    margin: 0,
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  info: { margin: "2px 0 0", fontSize: "0.78rem", color: "#888" },
  score: { textAlign: "center", flexShrink: 0 },
  scoreNum: {
    display: "block",
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#c8a96e",
  },
  scoreLbl: { fontSize: "0.65rem", color: "#aaa" },
};
