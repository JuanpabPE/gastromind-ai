import { useState, useEffect } from "react";
import {
  obtenerHistorial,
  obtenerResumen,
} from "../historial_consumo/historialApi";
import { useNavigate } from "react-router-dom";
import BotonChat from "../chatbot_nutricionista/BotonChat";
import TarjetaPuntos from "../fidelizacion/TarjetaPuntos";

export default function PaginaDashboard() {
  const [historial, setHistorial] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function cargar() {
      const [h, r] = await Promise.all([obtenerHistorial(), obtenerResumen()]);
      setHistorial(h);
      setResumen(r);
      setCargando(false);
    }
    cargar();
  }, []);

  if (cargando)
    return (
      <div style={estilos.pagina}>
        <p style={{ color: "#888", textAlign: "center", padding: "4rem" }}>
          Cargando tu dashboard...
        </p>
      </div>
    );

  return (
    <div style={estilos.pagina}>
      <div style={estilos.header}>
        <div>
          <h1 style={estilos.titulo}>Mi Dashboard Nutricional</h1>
          <p style={estilos.subtitulo}>Tu historial de consumo en Tanta</p>
        </div>
        <button onClick={() => navigate("/menu")} style={estilos.btnVolver}>
          ← Volver al menú
        </button>
      </div>

      <TarjetaPuntos />

      {/* Tarjetas resumen */}
      <div style={estilos.gridResumen}>
        <TarjetaResumen
          icono="🍽️"
          valor={resumen?.total_visitas || 0}
          label="Platos registrados"
          color="#c8a96e"
        />
        <TarjetaResumen
          icono="🔥"
          valor={`${resumen?.calorias_promedio || 0} kcal`}
          label="Promedio por plato"
          color="#ed8936"
        />
        <TarjetaResumen
          icono="📊"
          valor={`${resumen?.calorias_total || 0} kcal`}
          label="Total consumido"
          color="#48bb78"
        />
      </div>

      {/* Gráfico de barras simple */}
      {historial.length > 0 && (
        <div style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Calorías por visita</h2>
          <GraficoBarras registros={historial.slice(0, 10)} />
        </div>
      )}

      {/* Historial detallado */}
      <div style={estilos.seccion}>
        <h2 style={estilos.tituloSeccion}>Historial de platos</h2>
        {historial.length === 0 ? (
          <div style={estilos.vacio}>
            <p style={{ fontSize: "2rem" }}>🍽️</p>
            <p style={{ color: "#888" }}>Aún no has registrado ningún plato.</p>
            <button onClick={() => navigate("/menu")} style={estilos.btnIrMenu}>
              Explorar el menú
            </button>
          </div>
        ) : (
          <div style={estilos.listaHistorial}>
            {historial.map((item, i) => (
              <div key={i} style={estilos.itemHistorial}>
                <div style={estilos.itemInfo}>
                  <p style={estilos.itemNombre}>{item.plato_nombre}</p>
                  <p style={estilos.itemFecha}>
                    {new Date(item.fecha).toLocaleDateString("es-PE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p style={estilos.itemSede}>📍 {item.sede}</p>
                </div>
                <div style={estilos.itemNutri}>
                  <span
                    style={{
                      ...estilos.nutriBadge,
                      backgroundColor: "#fff8ee",
                      color: "#c8a96e",
                    }}
                  >
                    🔥 {item.calorias} kcal
                  </span>
                  <span
                    style={{
                      ...estilos.nutriBadge,
                      backgroundColor: "#f0fff4",
                      color: "#38a169",
                    }}
                  >
                    💪 {item.proteinas}g prot
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BotonChat />
    </div>
  );
}

function TarjetaResumen({ icono, valor, label, color }) {
  return (
    <div style={estilos.tarjetaResumen}>
      <span style={{ fontSize: "2rem" }}>{icono}</span>
      <p
        style={{
          fontSize: "1.6rem",
          fontWeight: "700",
          color,
          margin: "8px 0 4px",
        }}
      >
        {valor}
      </p>
      <p style={{ fontSize: "0.82rem", color: "#888", margin: 0 }}>{label}</p>
    </div>
  );
}

function GraficoBarras({ registros }) {
  const maxCal = Math.max(...registros.map((r) => r.calorias || 0));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "8px",
        height: "120px",
        padding: "0 4px",
      }}
    >
      {registros.map((r, i) => {
        const altura = maxCal > 0 ? ((r.calorias || 0) / maxCal) * 100 : 0;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <span style={{ fontSize: "0.65rem", color: "#888" }}>
              {r.calorias}
            </span>
            <div
              title={r.plato_nombre}
              style={{
                width: "100%",
                height: `${altura}%`,
                backgroundColor: "#c8a96e",
                borderRadius: "4px 4px 0 0",
                minHeight: "4px",
                transition: "height 0.3s",
              }}
            />
          </div>
        );
      })}
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
  gridResumen: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  tarjetaResumen: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  seccion: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  tituloSeccion: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "1rem",
    marginTop: 0,
  },
  vacio: { textAlign: "center", padding: "2rem" },
  btnIrMenu: {
    marginTop: "1rem",
    padding: "10px 24px",
    borderRadius: "8px",
    backgroundColor: "#c8a96e",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  listaHistorial: { display: "flex", flexDirection: "column", gap: "10px" },
  itemHistorial: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: "10px",
    backgroundColor: "#fdfcfa",
    border: "1px solid #f0ede8",
    gap: "12px",
  },
  itemInfo: { flex: 1 },
  itemNombre: {
    margin: "0 0 4px",
    fontWeight: "600",
    fontSize: "0.9rem",
    color: "#1a1a1a",
  },
  itemFecha: { margin: "0 0 2px", fontSize: "0.78rem", color: "#888" },
  itemSede: { margin: 0, fontSize: "0.75rem", color: "#aaa" },
  itemNutri: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    alignItems: "flex-end",
  },
  nutriBadge: {
    fontSize: "0.75rem",
    padding: "3px 8px",
    borderRadius: "20px",
    fontWeight: "500",
  },
};
