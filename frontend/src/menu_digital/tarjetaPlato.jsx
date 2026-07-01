export default function TarjetaPlato({ plato, tieneAlergeno, alerta, onClick }) {
  const conAlergeno = tieneAlergeno(plato);
  const advertenciaPrincipal = alerta?.advertencias?.find(
    (a) => a.nivel === "peligro",
  );
  const precaucionPrincipal = alerta?.advertencias?.find(
    (a) => a.nivel === "precaucion",
  );

  return (
    <div
      onClick={onClick}
      style={{
        ...estilos.tarjeta,
        border: conAlergeno ? "2px solid #fed7d7" : "1px solid #f0f0f0",
        cursor: "pointer",
      }}
    >
      {advertenciaPrincipal ? (
        <div style={estilos.alertaAlergeno}>
          {advertenciaPrincipal.tipo === "fooddata"
            ? "FoodData detecta un riesgo para tu perfil"
            : "Alerta: contiene alergenos de tu perfil"}
        </div>
      ) : precaucionPrincipal ? (
        <div style={estilos.alertaPrecaucion}>
          Precaucion nutricional para tu perfil
        </div>
      ) : (
        <div style={estilos.seguroPerfil}>Seguro para tu perfil</div>
      )}

      <div style={estilos.header}>
        <div style={{ flex: 1 }}>
          <h3 style={estilos.nombre}>{plato.nombre}</h3>
          <p style={estilos.descripcion}>{plato.descripcion}</p>
        </div>
        <span style={estilos.precio}>S/. {plato.precio}</span>
      </div>

      <div style={estilos.nutri}>
        <span style={estilos.nutriItem}>{plato.calorias} kcal</span>
        <span style={estilos.nutriItem}>{plato.proteinas}g prot</span>
        <span style={estilos.nutriItem}>{plato.carbohidratos}g carbs</span>
      </div>

      <div style={estilos.badges}>
        {plato.apto_vegetariano && (
          <span style={estilos.badge}>Vegetariano</span>
        )}
        {plato.apto_vegano && <span style={estilos.badge}>Vegano</span>}
        {plato.apto_sin_gluten && <span style={estilos.badge}>Sin gluten</span>}
        {plato.apto_diabetes && <span style={estilos.badge}>Diabetes</span>}
      </div>

      <p style={estilos.verMas}>Ver ficha nutricional</p>
    </div>
  );
}

const estilos = {
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.2rem",
    transition: "box-shadow 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  alertaAlergeno: {
    backgroundColor: "#fff5f5",
    color: "#e53e3e",
    fontSize: "0.78rem",
    fontWeight: "600",
    padding: "6px 10px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  alertaPrecaucion: {
    backgroundColor: "#fffbeb",
    color: "#c05621",
    fontSize: "0.78rem",
    fontWeight: "600",
    padding: "6px 10px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  seguroPerfil: {
    backgroundColor: "#f0fff4",
    color: "#2f855a",
    fontSize: "0.78rem",
    fontWeight: "600",
    padding: "6px 10px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },
  nombre: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 4px",
  },
  descripcion: {
    fontSize: "0.82rem",
    color: "#888",
    margin: 0,
    lineHeight: "1.4",
  },
  precio: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#c8a96e",
    whiteSpace: "nowrap",
  },
  nutri: {
    display: "flex",
    gap: "12px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  nutriItem: { fontSize: "0.8rem", color: "#555" },
  badges: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "10px",
  },
  badge: {
    fontSize: "0.72rem",
    padding: "2px 8px",
    borderRadius: "20px",
    backgroundColor: "#f0fff4",
    color: "#38a169",
    border: "1px solid #c6f6d5",
  },
  verMas: {
    fontSize: "0.8rem",
    color: "#c8a96e",
    fontWeight: "600",
    margin: 0,
  },
};
