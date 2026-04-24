import { useState, useEffect } from "react";
import { supabase } from "../compartido/api/cliente";
import { useNavigate } from "react-router-dom";

export default function PaginaAdmin() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function cargar() {
      const { data: historial } = await supabase
        .from("historial")
        .select("plato_nombre, calorias, proteinas, sede, fecha")
        .order("fecha", { ascending: false });

      const { data: perfiles } = await supabase
        .from("perfiles")
        .select("alergias, enfermedades, preferencias, puntos_fidelidad");

      if (!historial || !perfiles) return;

      // Platos más pedidos
      const conteo = {};
      historial.forEach((h) => {
        conteo[h.plato_nombre] = (conteo[h.plato_nombre] || 0) + 1;
      });
      const platosMasPedidos = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }));

      // Alérgenos más frecuentes
      const alergenosConteo = {};
      perfiles.forEach((p) => {
        (p.alergias || []).forEach((a) => {
          if (a !== "Ninguna")
            alergenosConteo[a] = (alergenosConteo[a] || 0) + 1;
        });
      });
      const alergenosFrecuentes = Object.entries(alergenosConteo)
        .sort((a, b) => b[1] - a[1])
        .map(([nombre, cantidad]) => ({ nombre, cantidad }));

      // Preferencias
      const prefConteo = {};
      perfiles.forEach((p) => {
        (p.preferencias || []).forEach((pref) => {
          if (pref !== "Ninguna")
            prefConteo[pref] = (prefConteo[pref] || 0) + 1;
        });
      });

      setDatos({
        totalRegistros: historial.length,
        totalUsuarios: perfiles.length,
        platosMasPedidos,
        alergenosFrecuentes,
        preferencias: Object.entries(prefConteo).map(([nombre, cantidad]) => ({
          nombre,
          cantidad,
        })),
        caloriasPromedio: historial.length
          ? Math.round(
              historial.reduce((s, h) => s + (h.calorias || 0), 0) /
                historial.length,
            )
          : 0,
      });
      setCargando(false);
    }
    cargar();
  }, []);

  if (cargando)
    return (
      <div style={estilos.pagina}>
        <p style={{ textAlign: "center", padding: "4rem", color: "#888" }}>
          Cargando analítica...
        </p>
      </div>
    );

  return (
    <div style={estilos.pagina}>
      <div style={estilos.header}>
        <div>
          <h1 style={estilos.titulo}>Analítica Tanta</h1>
          <p style={estilos.subtitulo}>Panel de insights para el restaurante</p>
        </div>
        <button onClick={() => navigate("/menu")} style={estilos.btnVolver}>
          ← Volver
        </button>
      </div>

      {/* KPIs */}
      <div style={estilos.gridKpi}>
        <Kpi
          icono="👥"
          valor={datos.totalUsuarios}
          label="Usuarios registrados"
        />
        <Kpi
          icono="🍽️"
          valor={datos.totalRegistros}
          label="Platos registrados"
        />
        <Kpi
          icono="🔥"
          valor={`${datos.caloriasPromedio} kcal`}
          label="Calorías promedio"
        />
      </div>

      <div style={estilos.grid2}>
        {/* Platos más pedidos */}
        <div style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>🏆 Platos más pedidos</h2>
          {datos.platosMasPedidos.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>
              Sin registros aún
            </p>
          ) : (
            datos.platosMasPedidos.map((p, i) => (
              <div key={i} style={estilos.itemRanking}>
                <span style={estilos.rankNum}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: "0.9rem" }}>{p.nombre}</span>
                <span style={estilos.rankCount}>{p.cantidad} veces</span>
              </div>
            ))
          )}
        </div>

        {/* Alérgenos frecuentes */}
        <div style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>⚠️ Alérgenos más frecuentes</h2>
          {datos.alergenosFrecuentes.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Sin datos aún</p>
          ) : (
            datos.alergenosFrecuentes.map((a, i) => (
              <div key={i} style={estilos.itemRanking}>
                <span style={{ flex: 1, fontSize: "0.9rem" }}>{a.nombre}</span>
                <span
                  style={{
                    ...estilos.rankCount,
                    backgroundColor: "#fff5f5",
                    color: "#e53e3e",
                  }}
                >
                  {a.cantidad} usuarios
                </span>
              </div>
            ))
          )}
        </div>

        {/* Preferencias */}
        <div style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>🥗 Preferencias alimentarias</h2>
          {datos.preferencias.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Sin datos aún</p>
          ) : (
            datos.preferencias.map((p, i) => (
              <div key={i} style={estilos.itemRanking}>
                <span style={{ flex: 1, fontSize: "0.9rem" }}>{p.nombre}</span>
                <span
                  style={{
                    ...estilos.rankCount,
                    backgroundColor: "#f0fff4",
                    color: "#38a169",
                  }}
                >
                  {p.cantidad} usuarios
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ icono, valor, label }) {
  return (
    <div style={estilos.kpi}>
      <span style={{ fontSize: "1.8rem" }}>{icono}</span>
      <p
        style={{
          fontSize: "1.8rem",
          fontWeight: "800",
          color: "#c8a96e",
          margin: "8px 0 4px",
        }}
      >
        {valor}
      </p>
      <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>{label}</p>
    </div>
  );
}

const estilos = {
  pagina: { minHeight: "100vh", backgroundColor: "#f5f0eb", padding: "1.5rem" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
  },
  titulo: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 4px",
  },
  subtitulo: { fontSize: "0.9rem", color: "#888", margin: 0 },
  btnVolver: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "0.85rem",
    color: "#555",
  },
  gridKpi: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  kpi: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  seccion: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  tituloSeccion: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 0,
    marginBottom: "1rem",
  },
  itemRanking: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  rankNum: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#c8a96e",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: "700",
    flexShrink: 0,
  },
  rankCount: {
    fontSize: "0.75rem",
    padding: "3px 10px",
    borderRadius: "20px",
    backgroundColor: "#f5f0eb",
    color: "#c8a96e",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
};
