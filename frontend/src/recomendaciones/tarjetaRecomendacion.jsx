export default function TarjetaRecomendacion({ plato, posicion, onClick }) {
  const explicacion = (
    plato.explicacion || "Compatible con tus preferencias y restricciones."
  )
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
    .trim();

  return (
    <div style={estilos.item} onClick={() => onClick && onClick(plato)}>
      <div style={estilos.numero}>{posicion}</div>
      <div style={{ flex: 1 }}>
        <p style={estilos.nombre}>{plato.nombre}</p>
        <p style={estilos.explicacion}>{explicacion}</p>
        <p style={estilos.info}>
          {plato.calorias} kcal · S/. {plato.precio}
        </p>
      </div>
    </div>
  );
}

const estilos = {
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#fdfcfa",
    border: "1px solid #f0ede8",
    cursor: "pointer",
  },
  numero: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#E91E63",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    fontWeight: "700",
    flexShrink: 0,
  },
  nombre: {
    margin: "0 0 4px",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  explicacion: {
    margin: "0 0 4px",
    fontSize: "0.78rem",
    color: "#666",
    lineHeight: "1.4",
  },
  info: { margin: 0, fontSize: "0.75rem", color: "#aaa" },
};
