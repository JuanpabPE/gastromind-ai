import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMenu } from "./useMenu";
import TarjetaPlato from "./TarjetaPlato";
import FiltrosMenu from "./FiltrosMenu";
import FichaNutricional from "./FichaNutricional";
import PanelRecomendaciones from "../recomendaciones/PanelRecomendaciones";
import BotonChat from "../chatbot_nutricionista/BotonChat";
import { supabase } from "../compartido/api/cliente";

export default function PaginaMenu() {
  const navigate = useNavigate();
  const { platos, cargando, filtros, setFiltros, tieneAlergeno } = useMenu();
  const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const categoriaActual = filtros.categoria || "Todos los platos";
  const platosPorCategoria = filtros.categoria
    ? platos
    : agruparPorCategoria(platos);

  useEffect(() => {
    async function verificar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("perfiles")
        .select("es_admin")
        .eq("usuario_id", user.id)
        .single();

      setEsAdmin(data?.es_admin || false);
    }
    verificar();
  }, []);

  return (
    <div style={estilos.pagina}>
      {/* Header */}
      <div style={estilos.header}>
        <div>
          <h1 style={estilos.titulo}>Menú Tanta</h1>
          <p style={estilos.subtitulo}>
            {platos.length} platos disponibles • Filtros aplicados según tu
            perfil
          </p>
        </div>
        <div style={estilos.accionesHeader}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "#c8a96e",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            📊 Mi Dashboard
          </button>
          {esAdmin && (
            <button
              onClick={() => navigate("/admin")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "#444",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              📈 Admin
            </button>
          )}
        </div>
      </div>

      {/* Panel de recomendaciones — NUEVO */}
      <PanelRecomendaciones onVerFicha={setPlatoSeleccionado} />

      <div style={estilos.layout}>
        {/* Sidebar filtros */}
        <div style={estilos.sidebar}>
          <FiltrosMenu filtros={filtros} setFiltros={setFiltros} />
        </div>

        {/* Platos */}
        <div style={estilos.contenido}>
          {cargando ? (
            <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>
              Cargando menú...
            </p>
          ) : platos.length === 0 ? (
            <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>
              No hay platos que coincidan con tus filtros.
            </p>
          ) : filtros.categoria ? (
            <div style={estilos.grid}>
              {platos.map((plato) => (
                <TarjetaPlato
                  key={plato.id}
                  plato={plato}
                  tieneAlergeno={tieneAlergeno}
                  onClick={() => setPlatoSeleccionado(plato)}
                />
              ))}
            </div>
          ) : (
            Object.entries(platosPorCategoria).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: "2rem" }}>
                <h2 style={estilos.categoriaLabel}>{cat}</h2>
                <div style={estilos.grid}>
                  {items.map((plato) => (
                    <TarjetaPlato
                      key={plato.id}
                      plato={plato}
                      tieneAlergeno={tieneAlergeno}
                      onClick={() => setPlatoSeleccionado(plato)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal ficha nutricional */}
      {platoSeleccionado && (
        <FichaNutricional
          plato={platoSeleccionado}
          onCerrar={() => setPlatoSeleccionado(null)}
        />
      )}

      {/* Botón chatbot — NUEVO */}
      <BotonChat />
    </div>
  );
}

function agruparPorCategoria(platos) {
  return platos.reduce((acc, plato) => {
    if (!acc[plato.categoria]) acc[plato.categoria] = [];
    acc[plato.categoria].push(plato);
    return acc;
  }, {});
}

const estilos = {
  pagina: { minHeight: "100vh", backgroundColor: "#f5f0eb", padding: "1.5rem" },
  header: {
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  },
  titulo: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 4px",
  },
  subtitulo: { fontSize: "0.9rem", color: "#888", margin: 0 },
  accionesHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: "1.5rem",
    alignItems: "start",
  },
  sidebar: { position: "sticky", top: "1.5rem" },
  contenido: { minWidth: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1rem",
  },
  categoriaLabel: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "1rem",
    paddingBottom: "8px",
    borderBottom: "2px solid #c8a96e",
  },
};
