const CATEGORIAS = [
  "",
  "Desayuno",
  "Sánguches",
  "Piqueos",
  "Sopas",
  "Ensaladas",
  "Pastas",
  "Platos Peruanos",
  "Postres",
  "Bebidas",
];

export default function FiltrosMenu({ filtros, setFiltros }) {
  function toggle(campo) {
    setFiltros((f) => ({ ...f, [campo]: !f[campo] }));
  }

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.grupo}>
        <label style={estilos.label}>Buscar por nombre</label>
        <input
          type="text"
          placeholder="Ej: Ceviche, Lomo..."
          value={filtros.busqueda || ""}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, busqueda: e.target.value }))
          }
          style={estilos.input}
        />
      </div>

      <div style={estilos.grupo}>
        <label style={estilos.label}>Categoría</label>
        <select
          value={filtros.categoria}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, categoria: e.target.value }))
          }
          style={estilos.select}
        >
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c || "Todas las categorías"}
            </option>
          ))}
        </select>
      </div>

      <div style={estilos.grupo}>
        <label style={estilos.label}>
          Calorías máx: {filtros.caloriasMax} kcal
        </label>
        <input
          type="range"
          min="200"
          max="1000"
          step="50"
          value={filtros.caloriasMax}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, caloriasMax: parseInt(e.target.value) }))
          }
          style={{ width: "100%" }}
        />
      </div>
      <div style={estilos.grupo}>
        <label style={estilos.label}>
          Proteínas mínimas: {filtros.proteinasMin}g
        </label>
        <input
          type="range"
          min="0"
          max="50"
          step="5"
          value={filtros.proteinasMin}
          onChange={(e) =>
            setFiltros((f) => ({
              ...f,
              proteinasMin: parseInt(e.target.value),
            }))
          }
          style={{ width: "100%" }}
        />
      </div>

      <div style={estilos.grupo}>
        <label style={estilos.label}>Preferencias</label>
        <div style={estilos.checks}>
          {[
            { campo: "vegetariano", label: "Vegetariano" },
            { campo: "vegano", label: "Vegano" },
            { campo: "sinGluten", label: "Sin gluten" },
            { campo: "diabetes", label: "Diabetes" },
            { campo: "hipertension", label: "Hipertensión" },
          ].map(({ campo, label }) => (
            <label key={campo} style={estilos.checkLabel}>
              <input
                type="checkbox"
                checked={filtros[campo]}
                onChange={() => toggle(campo)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

const estilos = {
  contenedor: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  grupo: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.82rem", fontWeight: "600", color: "#555" },
  input: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "0.9rem",
    backgroundColor: "#fff",
  },
  select: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "0.9rem",
    backgroundColor: "#fff",
  },
  checks: { display: "flex", flexDirection: "column", gap: "8px" },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.88rem",
    color: "#444",
    cursor: "pointer",
  },
};
