import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../compartido/api/cliente";
import { obtenerMesas, abrirPedido } from "./mozoPedidoApi";

const SEDES = [
  "Surco - Av. Primavera",
  "San Isidro - El Olivar",
  "Miraflores - Larco",
  "La Molina",
  "San Borja",
  "Aeropuerto",
];

export default function PaginaMozo() {
  const [sedeActual, setSedeActual] = useState(SEDES[0]);
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mozo, setMozo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function verificar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      const { data } = await supabase
        .from("perfiles")
        .select("nombre, es_mozo")
        .eq("usuario_id", user.id)
        .single();
      if (!data?.es_mozo) {
        navigate("/menu");
        return;
      }
      setMozo(data);
    }
    verificar();
  }, []);

  useEffect(() => {
    cargarMesas();
  }, [sedeActual]);

  async function cargarMesas() {
    setCargando(true);
    const data = await obtenerMesas(sedeActual);
    setMesas(data);
    setCargando(false);
  }

  async function handleAbrirMesa(mesa) {
    if (mesa.estado === "ocupada") {
      navigate(`/mozo/mesa/${mesa.id}`);
      return;
    }
    await abrirPedido(mesa.id);
    navigate(`/mozo/mesa/${mesa.id}`);
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.header}>
        <div>
          <h1 style={estilos.titulo}>Panel del Mozo</h1>
          <p style={estilos.subtitulo}>
            Hola, {mozo?.nombre?.split(" ")[0]} 👋
          </p>
        </div>
        <button onClick={() => navigate("/menu")} style={estilos.btnVolver}>
          ← Salir
        </button>
      </div>

      {/* Selector de sede */}
      <div style={estilos.sedeSelector}>
        <label
          style={{
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "#555",
            marginBottom: "6px",
            display: "block",
          }}
        >
          📍 Sede actual
        </label>
        <select
          value={sedeActual}
          onChange={(e) => setSedeActual(e.target.value)}
          style={estilos.select}
        >
          {SEDES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Leyenda */}
      <div style={estilos.leyenda}>
        <span style={estilos.leyendaItem}>
          <span style={{ ...estilos.dot, backgroundColor: "#48bb78" }} /> Libre
        </span>
        <span style={estilos.leyendaItem}>
          <span style={{ ...estilos.dot, backgroundColor: "#e53e3e" }} />{" "}
          Ocupada
        </span>
      </div>

      {/* Grid de mesas */}
      {cargando ? (
        <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>
          Cargando mesas...
        </p>
      ) : (
        <div style={estilos.gridMesas}>
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              onClick={() => handleAbrirMesa(mesa)}
              style={{
                ...estilos.mesa,
                backgroundColor:
                  mesa.estado === "ocupada" ? "#fff5f5" : "#f0fff4",
                borderColor: mesa.estado === "ocupada" ? "#e53e3e" : "#48bb78",
              }}
            >
              <span style={estilos.mesaNumero}>{mesa.numero}</span>
              <span
                style={{
                  ...estilos.mesaEstado,
                  color: mesa.estado === "ocupada" ? "#e53e3e" : "#48bb78",
                }}
              >
                {mesa.estado === "ocupada" ? "● Ocupada" : "● Libre"}
              </span>
              {mesa.estado === "ocupada" && (
                <span style={estilos.mesaVer}>Ver pedido →</span>
              )}
              {mesa.estado === "libre" && (
                <span style={estilos.mesaVer}>Abrir mesa →</span>
              )}
            </button>
          ))}
        </div>
      )}
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
  sedeSelector: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.2rem",
    marginBottom: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "0.95rem",
    backgroundColor: "#fff",
  },
  leyenda: {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "1rem",
    padding: "0 4px",
  },
  leyendaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.85rem",
    color: "#555",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    display: "inline-block",
  },
  gridMesas: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "12px",
  },
  mesa: {
    borderRadius: "12px",
    border: "2px solid",
    padding: "1rem",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    transition: "transform 0.1s",
    textAlign: "center",
  },
  mesaNumero: { fontSize: "2rem", fontWeight: "800", color: "#1a1a1a" },
  mesaEstado: { fontSize: "0.75rem", fontWeight: "600" },
  mesaVer: { fontSize: "0.7rem", color: "#888" },
};
