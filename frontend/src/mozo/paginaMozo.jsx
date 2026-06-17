import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../compartido/api/cliente";
import { obtenerMesas, abrirPedido } from "./mozoPedidoApi";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

  // Canje
  const [emailBusqueda, setEmailBusqueda] = useState("");
  const [clienteCanje, setClienteCanje] = useState(null);
  const [premios, setPremios] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mensajeCanje, setMensajeCanje] = useState(null);
  const [seccionCanje, setSeccionCanje] = useState(false);

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
    cargarPremios();
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

  async function cargarPremios() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch(`${API}/premios/`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    const data = await res.json();
    setPremios(data);
  }

  async function handleAbrirMesa(mesa) {
    if (mesa.estado === "ocupada") {
      navigate(`/mozo/mesa/${mesa.id}`);
      return;
    }
    await abrirPedido(mesa.id);
    navigate(`/mozo/mesa/${mesa.id}`);
  }

  async function buscarCliente() {
    if (!emailBusqueda.trim()) return;
    setBuscando(true);
    setClienteCanje(null);
    setMensajeCanje(null);

    // Buscar en perfiles por email via auth
    const { data, error } = await supabase
      .from("perfiles")
      .select("usuario_id, nombre, puntos_fidelidad")
      .ilike("nombre", `%${emailBusqueda}%`)
      .limit(5);

    if (error || !data?.length) {
      // Intentar buscar por email directamente en auth
      setMensajeCanje({
        tipo: "error",
        texto: "Cliente no encontrado. Busca por nombre.",
      });
      setBuscando(false);
      return;
    }

    setClienteCanje(data[0]);
    setBuscando(false);
  }

  async function handleCanjear(premio) {
    if (!clienteCanje) return;
    if (clienteCanje.puntos_fidelidad < premio.puntos_requeridos) {
      setMensajeCanje({
        tipo: "error",
        texto: "El cliente no tiene suficientes puntos.",
      });
      return;
    }
    if (
      !confirm(
        `¿Canjear "${premio.nombre}" por ${premio.puntos_requeridos} puntos?`,
      )
    )
      return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch(`${API}/premios/canjear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        usuario_id: clienteCanje.usuario_id,
        premio_id: premio.id,
        mozo_nombre: mozo?.nombre || "Mozo",
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMensajeCanje({ tipo: "ok", texto: data.mensaje });
      setClienteCanje({
        ...clienteCanje,
        puntos_fidelidad: data.puntos_restantes,
      });
    } else {
      setMensajeCanje({
        tipo: "error",
        texto: data.detail || "Error al canjear",
      });
    }
  }

  const premiosDisponibles = clienteCanje
    ? premios.filter(
        (p) => p.puntos_requeridos <= clienteCanje.puntos_fidelidad,
      )
    : [];
  const premiosSiguientes = clienteCanje
    ? premios
        .filter((p) => p.puntos_requeridos > clienteCanje.puntos_fidelidad)
        .slice(0, 2)
    : [];

  return (
    <div style={estilos.pagina}>
      <div style={estilos.header}>
        <div>
          <h1 style={estilos.titulo}>Panel del Mozo</h1>
          <p style={estilos.subtitulo}>
            Hola, {mozo?.nombre?.split(" ")[0]} 👋
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setSeccionCanje(!seccionCanje)}
            style={{
              ...estilos.btnVolver,
              backgroundColor: seccionCanje ? "#c8a96e" : "#fff",
              color: seccionCanje ? "#fff" : "#555",
              borderColor: seccionCanje ? "#c8a96e" : "#e0e0e0",
            }}
          >
            Canjear premio
          </button>
          <button
            onClick={() => navigate("/mozo/qr")}
            style={estilos.btnVolver}
          >
            Generar QR
          </button>
          <button onClick={() => navigate("/menu")} style={estilos.btnVolver}>
            ← Salir
          </button>
        </div>
      </div>

      {/* Sección de canje */}
      {seccionCanje && (
        <div style={estilos.seccionCanje}>
          <h2 style={estilos.tituloSeccion}>Canje de premios</h2>

          <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
            <input
              placeholder="Buscar cliente por nombre..."
              value={emailBusqueda}
              onChange={(e) => setEmailBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscarCliente()}
              style={estilos.inputBusqueda}
            />
            <button
              onClick={buscarCliente}
              style={estilos.btnBuscar}
              disabled={buscando}
            >
              {buscando ? "..." : "Buscar"}
            </button>
          </div>

          {mensajeCanje && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "1rem",
                backgroundColor:
                  mensajeCanje.tipo === "ok" ? "#f0fff4" : "#fff5f5",
                color: mensajeCanje.tipo === "ok" ? "#38a169" : "#e53e3e",
                border: `1px solid ${mensajeCanje.tipo === "ok" ? "#c6f6d5" : "#fed7d7"}`,
                fontSize: "0.88rem",
                fontWeight: "500",
              }}
            >
              {mensajeCanje.texto}
            </div>
          )}

          {clienteCanje && (
            <div style={estilos.tarjetaCliente}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: "700", fontSize: "1rem" }}>
                    {clienteCanje.nombre}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "0.82rem",
                      color: "#888",
                    }}
                  >
                    Cliente encontrado
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.8rem",
                      fontWeight: "800",
                      color: "#c8a96e",
                    }}
                  >
                    {clienteCanje.puntos_fidelidad}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>
                    puntos
                  </p>
                </div>
              </div>

              {premiosDisponibles.length > 0 ? (
                <div style={{ marginTop: "1rem" }}>
                  <p style={estilos.labelSeccion}>
                    Premios disponibles para canjear:
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {premiosDisponibles.map((p) => (
                      <div key={p.id} style={estilos.itemPremio}>
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: "600",
                              fontSize: "0.9rem",
                            }}
                          >
                            {p.nombre}
                          </p>
                          <p
                            style={{
                              margin: "2px 0 0",
                              fontSize: "0.78rem",
                              color: "#888",
                            }}
                          >
                            {p.descripcion}
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span style={estilos.puntosTag}>
                            {p.puntos_requeridos} pts
                          </span>
                          <button
                            onClick={() => handleCanjear(p)}
                            style={estilos.btnCanjear}
                          >
                            Canjear
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.85rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  El cliente aún no tiene puntos suficientes para ningún premio.
                </p>
              )}

              {premiosSiguientes.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <p style={estilos.labelSeccion}>Próximos premios:</p>
                  {premiosSiguientes.map((p) => (
                    <div
                      key={p.id}
                      style={{ ...estilos.itemPremio, opacity: 0.5 }}
                    >
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: "600",
                            fontSize: "0.88rem",
                          }}
                        >
                          {p.nombre}
                        </p>
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "#888" }}>
                        Faltan{" "}
                        {p.puntos_requeridos - clienteCanje.puntos_fidelidad}{" "}
                        pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
              <span style={estilos.mesaVer}>
                {mesa.estado === "ocupada" ? "Ver pedido →" : "Abrir mesa →"}
              </span>
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
  seccionCanje: {
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
    margin: "0 0 1rem",
  },
  inputBusqueda: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "0.9rem",
  },
  btnBuscar: {
    padding: "10px 20px",
    borderRadius: "8px",
    backgroundColor: "#2C5F8A",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.88rem",
  },
  tarjetaCliente: {
    backgroundColor: "#fdfcfa",
    borderRadius: "10px",
    padding: "1.2rem",
    border: "1px solid #f0ede8",
  },
  labelSeccion: {
    fontSize: "0.78rem",
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 8px",
  },
  itemPremio: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    border: "1px solid #f0f0f0",
  },
  puntosTag: {
    fontSize: "0.78rem",
    fontWeight: "700",
    color: "#c8a96e",
    backgroundColor: "#fef9f0",
    padding: "3px 8px",
    borderRadius: "10px",
    whiteSpace: "nowrap",
  },
  btnCanjear: {
    padding: "6px 14px",
    borderRadius: "6px",
    backgroundColor: "#48bb78",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.82rem",
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
    textAlign: "center",
  },
  mesaNumero: { fontSize: "2rem", fontWeight: "800", color: "#1a1a1a" },
  mesaEstado: { fontSize: "0.75rem", fontWeight: "600" },
  mesaVer: { fontSize: "0.7rem", color: "#888" },
};
