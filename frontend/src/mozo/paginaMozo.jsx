import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../compartido/api/cliente";
import { obtenerMesas, abrirPedido } from "./mozoPedidoApi";
import logoTanta from "../assets/images/logo_tanta.png";

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
    if (mozo) cargarMesas();
  }, [sedeActual, mozo]);

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
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) setPremios(data);
  }

  async function handleAbrirMesa(mesa) {
    if (mesa.estado === "ocupada") {
      navigate(`/mozo/mesa/${mesa.id}`);
      return;
    }
    await abrirPedido(mesa.id);
    navigate(`/mozo/mesa/${mesa.id}`);
  }

  async function handleLiberarMesa(mesa, e) {
    e.stopPropagation();
    if (
      !confirm(`¿Liberar mesa ${mesa.numero}? Se cancelará el pedido activo.`)
    )
      return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    await fetch(`${API}/pedidos/mesas/${mesa.id}/liberar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    cargarMesas();
  }

  async function buscarCliente() {
    if (!emailBusqueda.trim()) return;
    setBuscando(true);
    setClienteCanje(null);
    setMensajeCanje(null);
    const { data, error } = await supabase
      .from("perfiles")
      .select("usuario_id, nombre, puntos_fidelidad, codigo_cliente")
      .or(
        `nombre.ilike.%${emailBusqueda}%,codigo_cliente.ilike.%${emailBusqueda}%`,
      )
      .limit(5);
    if (error || !data?.length) {
      setMensajeCanje({
        tipo: "error",
        texto: "Cliente no encontrado. Busca por nombre o por id.",
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
  const mesasLibres = mesas.filter((m) => m.estado === "libre").length;
  const mesasOcupadas = mesas.filter((m) => m.estado === "ocupada").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f0eb",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ backgroundColor: "#E91E63" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={logoTanta}
              alt="TANTA"
              style={{ height: "40px", width: "auto" }}
            />
            <div>
              <h1
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  margin: 0,
                  color: "#fff",
                }}
              >
                Panel del Mozo
              </h1>
              <p
                style={{
                  fontSize: "0.75rem",
                  margin: 0,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Hola, {mozo?.nombre?.split(" ")[0]} 👋
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setSeccionCanje(!seccionCanje)}
              style={{
                ...estilos.btnHeader,
                backgroundColor: seccionCanje
                  ? "rgba(255,255,255,0.25)"
                  : "transparent",
              }}
            >
              🎁 Canjear premio
            </button>
            <button
              onClick={() => navigate("/mozo/qr")}
              style={estilos.btnHeader}
            >
              🖨️ Generar QR
            </button>
            <button
              onClick={() => navigate("/menu")}
              style={{
                ...estilos.btnHeader,
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            >
              ← Salir
            </button>
          </div>
        </div>
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.15)",
            padding: "0.5rem 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.85)" }}
            >
              📍 {sedeActual}
            </span>
            <span style={{ fontSize: "0.8rem", color: "#a8f0c6" }}>
              ● {mesasLibres} libres
            </span>
            <span style={{ fontSize: "0.8rem", color: "#fca5a5" }}>
              ● {mesasOcupadas} ocupadas
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
        {/* Sección de canje */}
        {seccionCanje && (
          <div style={estilos.card}>
            <h2 style={estilos.cardTitulo}>🎁 Canje de premios</h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
              <input
                placeholder="Buscar cliente por nombre o por id"
                value={emailBusqueda}
                onChange={(e) => setEmailBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarCliente()}
                style={estilos.inputStyle}
              />
              <button
                onClick={buscarCliente}
                style={estilos.btnPrimario}
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
              <div
                style={{
                  backgroundColor: "#fdfcfa",
                  borderRadius: "10px",
                  padding: "1.2rem",
                  border: "1px solid #f0ede8",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <p
                      style={{ margin: 0, fontWeight: "700", fontSize: "1rem" }}
                    >
                      {clienteCanje.nombre}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "0.8rem",
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
                        fontSize: "2rem",
                        fontWeight: "800",
                        color: "#c8a96e",
                      }}
                    >
                      {clienteCanje.puntos_fidelidad}
                    </p>
                    <p
                      style={{ margin: 0, fontSize: "0.72rem", color: "#888" }}
                    >
                      puntos
                    </p>
                  </div>
                </div>
                {premiosDisponibles.length > 0 ? (
                  <div>
                    <p style={estilos.labelSeccion}>Premios disponibles:</p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {premiosDisponibles.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            backgroundColor: "#fff",
                            border: "1px solid #f0f0f0",
                          }}
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
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: "0.75rem",
                                color: "#888",
                              }}
                            >
                              {p.descripcion}
                            </p>
                          </div>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              color: "#c8a96e",
                              backgroundColor: "#fef9f0",
                              padding: "3px 8px",
                              borderRadius: "10px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.puntos_requeridos} pts
                          </span>
                          <button
                            onClick={() => handleCanjear(p)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "6px",
                              backgroundColor: "#48bb78",
                              color: "#fff",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "0.8rem",
                            }}
                          >
                            Canjear
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#aaa",
                      textAlign: "center",
                      margin: "1rem 0 0",
                    }}
                  >
                    Sin puntos suficientes para ningún premio aún.
                  </p>
                )}
                {premiosSiguientes.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <p style={estilos.labelSeccion}>Próximos premios:</p>
                    {premiosSiguientes.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          opacity: 0.5,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.85rem",
                            fontWeight: "600",
                          }}
                        >
                          {p.nombre}
                        </p>
                        <span style={{ fontSize: "0.75rem", color: "#888" }}>
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
        <div style={estilos.card}>
          <label
            style={{
              fontSize: "0.82rem",
              fontWeight: "600",
              color: "#555",
              display: "block",
              marginBottom: "8px",
            }}
          >
            📍 Sede actual
          </label>
          <select
            value={sedeActual}
            onChange={(e) => setSedeActual(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              fontSize: "0.95rem",
              backgroundColor: "#fff",
            }}
          >
            {SEDES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Leyenda */}
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              color: "#555",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#48bb78",
                display: "inline-block",
              }}
            />{" "}
            Libre — clic para abrir
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              color: "#555",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#e53e3e",
                display: "inline-block",
              }}
            />{" "}
            Ocupada — clic para ver pedido
          </span>
        </div>

        {/* Grid de mesas */}
        {cargando ? (
          <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>
            Cargando mesas...
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            {mesas.map((mesa) => (
              <div
                key={mesa.id}
                style={{
                  borderRadius: "12px",
                  border: `2px solid ${mesa.estado === "ocupada" ? "#e53e3e" : "#48bb78"}`,
                  backgroundColor:
                    mesa.estado === "ocupada" ? "#fff5f5" : "#f0fff4",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  textAlign: "center",
                }}
              >
                <button
                  onClick={() => handleAbrirMesa(mesa)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "2rem",
                      fontWeight: "800",
                      color: "#1a1a1a",
                    }}
                  >
                    {mesa.numero}
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: "600",
                      color: mesa.estado === "ocupada" ? "#e53e3e" : "#48bb78",
                    }}
                  >
                    {mesa.estado === "ocupada" ? "● Ocupada" : "● Libre"}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "#888" }}>
                    {mesa.estado === "ocupada"
                      ? "Ver pedido →"
                      : "Abrir mesa →"}
                  </span>
                </button>
                {mesa.estado === "ocupada" && (
                  <button
                    onClick={(e) => handleLiberarMesa(mesa, e)}
                    style={{
                      marginTop: "6px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      backgroundColor: "#fff",
                      border: "1px solid #e53e3e",
                      color: "#e53e3e",
                      fontSize: "0.65rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Liberar mesa
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const estilos = {
  btnHeader: {
    padding: "7px 14px",
    borderRadius: "6px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.2rem",
    marginBottom: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  cardTitulo: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 1rem",
  },
  inputStyle: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "0.9rem",
  },
  btnPrimario: {
    padding: "10px 20px",
    borderRadius: "8px",
    backgroundColor: "#E91E63",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.88rem",
  },
  labelSeccion: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 8px",
  },
};
