import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../compartido/api/cliente";
import {
  obtenerPedidoActivo,
  obtenerItems,
  agregarItem,
  eliminarItem,
  finalizarPedido,
} from "./mozoPedidoApi";

export default function PaginaGestionMesa() {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [items, setItems] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mesaInfo, setMesaInfo] = useState(null);

  const cargarTodo = useCallback(async () => {
    // Info de la mesa
    const { data: mesa } = await supabase
      .from("mesas")
      .select("*")
      .eq("id", mesaId)
      .single();
    setMesaInfo(mesa);

    // Pedido activo
    const pedidoData = await obtenerPedidoActivo(mesaId);
    setPedido(pedidoData);

    if (pedidoData) {
      const itemsData = await obtenerItems(pedidoData.id);
      setItems(itemsData);

      const clientesUnicos = [];
      const idsVistos = new Set();

      // Clientes desde items
      itemsData.forEach((item) => {
        if (item.usuario_id && !idsVistos.has(item.usuario_id)) {
          idsVistos.add(item.usuario_id);
          clientesUnicos.push({
            id: item.usuario_id,
            nombre: item.usuario_nombre || "Cliente",
          });
        }
      });

      // Clientes que se unieron via QR
      (pedidoData.clientes_unidos || []).forEach((c) => {
        if (!idsVistos.has(c.id)) {
          idsVistos.add(c.id);
          clientesUnicos.push(c);
        }
      });

      setClientes(clientesUnicos);
    }

    // Menú completo
    const { data: menuData } = await supabase
      .from("menu")
      .select("*")
      .eq("disponible", true)
      .order("categoria");
    setPlatos(menuData || []);
    setCargando(false);
  }, [mesaId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarTodo();
  }, [cargarTodo]);

  async function handleAgregarPlato(plato) {
    if (!pedido) return;
    if (!clienteSeleccionado) {
      alert(
        "Selecciona un cliente antes de agregar el plato, o elige 'Sin asignar' para platos compartidos",
      );
      return;
    }
    const puntos =
      plato.apto_diabetes || plato.apto_vegetariano || plato.calorias < 400
        ? 20
        : 10;
    await agregarItem(pedido.id, {
      plato_id: plato.id,
      plato_nombre: plato.nombre,
      calorias: plato.calorias,
      precio: plato.precio,
      usuario_id: clienteSeleccionado?.id || null,
      usuario_nombre: clienteSeleccionado?.nombre || "Sin asignar",
      puntos_ganados: clienteSeleccionado ? puntos : 0,
    });
    const nuevosItems = await obtenerItems(pedido.id);
    setItems(nuevosItems);
  }

  async function handleEliminar(itemId) {
    await eliminarItem(pedido.id, itemId);
    setItems(items.filter((i) => i.id !== itemId));
  }

  async function handleFinalizar() {
    if (!confirm("¿Finalizar el pedido y liberar la mesa?")) return;
    await finalizarPedido(pedido.id, mesaId);
    navigate("/mozo");
  }

  const platosFiltrados = platos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const totalPedido = items.reduce((sum, i) => sum + (i.precio || 0), 0);

  if (cargando)
    return (
      <div style={estilos.pagina}>
        <p style={{ textAlign: "center", padding: "4rem", color: "#888" }}>
          Cargando...
        </p>
      </div>
    );

  return (
    <div style={estilos.pagina}>
      {/* Header */}
      <div style={estilos.header}>
        <div>
          <h1 style={estilos.titulo}>Mesa {mesaInfo?.numero}</h1>
          <p style={estilos.subtitulo}>{mesaInfo?.sede}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigate("/mozo")}
            style={estilos.btnSecundario}
          >
            ← Volver
          </button>
          {pedido && (
            <button onClick={handleFinalizar} style={estilos.btnFinalizar}>
              ✓ Finalizar pedido
            </button>
          )}
        </div>
      </div>

      <div style={estilos.layout}>
        {/* Panel izquierdo — menú */}
        <div style={estilos.panelMenu}>
          <h2 style={estilos.tituloPanel}>Agregar platos</h2>

          {/* Selector de cliente */}
          <div style={estilos.selectorCliente}>
            <label style={estilos.labelPequeno}>Asignar a:</label>
            <div style={estilos.botonesCiente}>
              <button
                onClick={() => setClienteSeleccionado(null)}
                style={{
                  ...estilos.btnCliente,
                  backgroundColor: !clienteSeleccionado ? "#c8a96e" : "#f5f5f5",
                  color: !clienteSeleccionado ? "#fff" : "#555",
                }}
              >
                Sin asignar
              </button>
              {clientes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setClienteSeleccionado(c)}
                  style={{
                    ...estilos.btnCliente,
                    backgroundColor:
                      clienteSeleccionado?.id === c.id ? "#c8a96e" : "#f5f5f5",
                    color: clienteSeleccionado?.id === c.id ? "#fff" : "#555",
                  }}
                >
                  👤 {c.nombre.split(" ")[0]}
                </button>
              ))}
            </div>
            {clientes.length === 0 && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#aaa",
                  margin: "4px 0 0",
                }}
              >
                Los clientes se unen escaneando el QR de la mesa
              </p>
            )}
          </div>

          {/* Búsqueda */}
          <input
            placeholder="Buscar plato..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={estilos.buscador}
          />

          {/* Lista de platos */}
          <div style={estilos.listaPlatos}>
            {platosFiltrados.map((plato) => (
              <div key={plato.id} style={estilos.itemPlato}>
                <div style={{ flex: 1 }}>
                  <p style={estilos.platoNombre}>{plato.nombre}</p>
                  <p style={estilos.platoInfo}>
                    {plato.calorias} kcal · S/. {plato.precio}
                  </p>
                </div>
                <button
                  onClick={() => handleAgregarPlato(plato)}
                  style={estilos.btnAgregar}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho — pedido actual */}
        <div style={estilos.panelPedido}>
          <h2 style={estilos.tituloPanel}>Pedido actual</h2>

          {items.length === 0 ? (
            <p
              style={{
                color: "#aaa",
                fontSize: "0.9rem",
                textAlign: "center",
                padding: "2rem 0",
              }}
            >
              Aún no hay platos en el pedido
            </p>
          ) : (
            <>
              {/* Agrupa por cliente */}
              {agruparPorCliente(items).map((grupo) => (
                <div key={grupo.cliente} style={estilos.grupoCliente}>
                  <p style={estilos.grupoTitulo}>
                    {grupo.cliente === "Sin asignar"
                      ? "👥 Sin asignar"
                      : `👤 ${grupo.cliente}`}
                  </p>
                  {grupo.items.map((item) => (
                    <div key={item.id} style={estilos.itemPedido}>
                      <span style={{ flex: 1, fontSize: "0.88rem" }}>
                        {item.plato_nombre}
                      </span>
                      {item.puntos_ganados > 0 && (
                        <span style={estilos.puntosTag}>
                          +{item.puntos_ganados}pts
                        </span>
                      )}
                      <span style={estilos.precioItem}>S/. {item.precio}</span>
                      <button
                        onClick={() => handleEliminar(item.id)}
                        style={estilos.btnEliminar}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ))}

              <div style={estilos.total}>
                <span style={{ fontWeight: "600" }}>Total</span>
                <span
                  style={{
                    fontWeight: "800",
                    color: "#c8a96e",
                    fontSize: "1.1rem",
                  }}
                >
                  S/. {totalPedido.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function agruparPorCliente(items) {
  const grupos = {};
  items.forEach((item) => {
    const key = item.usuario_nombre || "Sin asignar";
    if (!grupos[key]) grupos[key] = { cliente: key, items: [] };
    grupos[key].items.push(item);
  });
  return Object.values(grupos);
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
  btnSecundario: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "0.85rem",
    color: "#555",
  },
  btnFinalizar: {
    padding: "8px 20px",
    borderRadius: "8px",
    backgroundColor: "#48bb78",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "1.5rem",
    alignItems: "start",
  },
  panelMenu: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  panelPedido: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    position: "sticky",
    top: "1.5rem",
  },
  tituloPanel: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 0,
    marginBottom: "1rem",
  },
  selectorCliente: {
    marginBottom: "1rem",
    padding: "10px 12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },
  labelPequeno: {
    fontSize: "0.78rem",
    fontWeight: "600",
    color: "#555",
    display: "block",
    marginBottom: "6px",
  },
  botonesCiente: { display: "flex", gap: "6px", flexWrap: "wrap" },
  btnCliente: {
    padding: "4px 12px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  buscador: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "0.9rem",
    marginBottom: "1rem",
    boxSizing: "border-box",
  },
  listaPlatos: {
    maxHeight: "55vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  itemPlato: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    borderRadius: "8px",
    backgroundColor: "#fdfcfa",
    border: "1px solid #f0ede8",
  },
  platoNombre: {
    margin: 0,
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  platoInfo: { margin: "2px 0 0", fontSize: "0.75rem", color: "#888" },
  btnAgregar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#c8a96e",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  grupoCliente: { marginBottom: "12px" },
  grupoTitulo: {
    fontSize: "0.78rem",
    fontWeight: "700",
    color: "#888",
    margin: "0 0 6px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  itemPedido: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 8px",
    borderRadius: "6px",
    backgroundColor: "#fafafa",
    marginBottom: "4px",
  },
  puntosTag: {
    fontSize: "0.7rem",
    color: "#48bb78",
    fontWeight: "700",
    backgroundColor: "#f0fff4",
    padding: "2px 6px",
    borderRadius: "10px",
  },
  precioItem: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#c8a96e",
    whiteSpace: "nowrap",
  },
  btnEliminar: {
    background: "none",
    border: "none",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "0.8rem",
    padding: "2px",
  },
  total: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "2px solid #f0f0f0",
    paddingTop: "12px",
    marginTop: "8px",
  },
};
