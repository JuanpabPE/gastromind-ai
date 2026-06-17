import { useState, useEffect } from "react";
import { useMenu } from "./useMenu";
import TarjetaPlato from "./tarjetaPlato";
import FiltrosMenu from "./filtrosMenu";
import FichaNutricional from "./fichaNutricional";
import PanelRecomendaciones from "../recomendaciones/panelRecomendaciones";
import BotonChat from "../chatbot_nutricionista/botonChat";
import { useNavigate } from "react-router-dom";
import { supabase } from "../compartido/api/cliente";
import { tema } from "../compartido/estilos/tema";
import logoTanta from "../assets/images/logo_tanta.png";

export default function PaginaMenu() {
  const { platos, cargando, filtros, setFiltros, tieneAlergeno } = useMenu();
  const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [esMozo, setEsMozo] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function verificar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      const { data } = await supabase
        .from("perfiles")
        .select("nombre, es_admin, es_mozo")
        .eq("usuario_id", user.id)
        .single();
      setEsAdmin(data?.es_admin || false);
      setEsMozo(data?.es_mozo || false);
      setNombreUsuario(data?.nombre?.split(" ")[0] || "");
      setVerificandoSesion(false);
    }
    verificar();
  }, []);

  const platosPorCategoria = filtros.categoria
    ? platos
    : agruparPorCategoria(platos);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: tema.cremaSuave,
        fontFamily: tema.fuenteCuerpo,
      }}
    >
      {/* Header */}
      <div style={estilos.header}>
        <div style={estilos.headerContenido} className="menu-header-contenido">
          <div style={estilos.logoArea}>
            <img
              src={logoTanta}
              alt="TANTA Logo"
              style={{ height: "48px", width: "auto" }}
            />
            <div>
              <h1 style={estilos.logoTitulo}>Tanta</h1>
              <p style={estilos.logoSub}>Carta Digital</p>
            </div>
          </div>

          <div style={estilos.headerAcciones} className="menu-header-acciones">
            {nombreUsuario && (
              <span style={estilos.saludo}>Bienvenido, {nombreUsuario}</span>
            )}
            <button
              onClick={() => navigate("/dashboard")}
              style={estilos.btnHeader}
            >
              Mi Dashboard
            </button>
            {esMozo && (
              <button
                onClick={() => navigate("/mozo")}
                style={{
                  ...estilos.btnHeader,
                  backgroundColor: "#2C5F8A",
                  borderColor: "#2C5F8A",
                }}
              >
                Panel Mozo
              </button>
            )}
            {esAdmin && (
              <button
                onClick={() => navigate("/admin")}
                style={{
                  ...estilos.btnHeader,
                  backgroundColor: tema.grisOscuro,
                  borderColor: tema.grisOscuro,
                }}
              >
                Administracion
              </button>
            )}
            <button
              onClick={handleLogout}
              style={{
                ...estilos.btnHeader,
                backgroundColor: "#C2185B",
                borderColor: "#C2185B",
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Instrucciones de uso */}
        <div style={estilos.instrucciones}>
          <div style={estilos.instruccionItem}>
            <span style={estilos.instruccionNumero}>1</span>
            <span>
              Revisa tus recomendaciones personalizadas segun tu perfil de salud
            </span>
          </div>
          <div style={estilos.instruccionItem}>
            <span style={estilos.instruccionNumero}>2</span>
            <span>
              Usa los filtros para explorar la carta por categoria, calorias o
              proteinas
            </span>
          </div>
          <div style={estilos.instruccionItem}>
            <span style={estilos.instruccionNumero}>3</span>
            <span>
              Haz clic en cualquier plato para ver su ficha nutricional completa
            </span>
          </div>
          <div style={estilos.instruccionItem}>
            <span style={estilos.instruccionNumero}>4</span>
            <span>
              Consulta al nutricionista virtual si tienes dudas sobre algun
              plato
            </span>
          </div>
        </div>
      </div>

      <div style={estilos.contenedor}>
        {/* Recomendaciones */}
        <PanelRecomendaciones onVerFicha={setPlatoSeleccionado} />

        <div style={estilos.layout} className="menu-layout">
          {/* Sidebar */}
          <div style={estilos.sidebar} className="menu-sidebar">
            <div style={estilos.filtrosTitulo}>
              <h3
                style={{
                  fontFamily: tema.fuenteTitulo,
                  fontSize: "1rem",
                  color: tema.negro,
                  margin: 0,
                }}
              >
                Filtrar carta
              </h3>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: tema.grisMedio,
                  margin: "4px 0 0",
                }}
              >
                {platos.length} platos disponibles
              </p>
            </div>
            <FiltrosMenu filtros={filtros} setFiltros={setFiltros} />
          </div>

          {/* Platos */}
          <div style={{ minWidth: 0 }}>
            {verificandoSesion || cargando ? (
              <div style={estilos.estadoVacio}>
                <p style={{ color: tema.grisMedio }}>
                  Verificando sesión y cargando carta...
                </p>
              </div>
            ) : platos.length === 0 ? (
              <div style={estilos.estadoVacio}>
                <p style={{ color: tema.grisMedio, fontSize: "0.95rem" }}>
                  No hay platos que coincidan con los filtros seleccionados.
                </p>
                <button
                  onClick={() =>
                    setFiltros((f) => ({
                      ...f,
                      categoria: "",
                      busqueda: "",
                      vegetariano: false,
                      vegano: false,
                      sinGluten: false,
                      diabetes: false,
                      hipertension: false,
                      caloriasMax: 1000,
                      proteinasMin: 0,
                    }))
                  }
                  style={estilos.btnLimpiar}
                >
                  Limpiar filtros
                </button>
              </div>
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
                <div key={cat} style={{ marginBottom: "2.5rem" }}>
                  <div style={estilos.categoriaHeader}>
                    <h2 style={estilos.categoriaTitulo}>
                      {limpiarEmojis(cat)}
                    </h2>
                    <div style={estilos.categoriaLinea} />
                  </div>
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
      </div>

      {platoSeleccionado && (
        <FichaNutricional
          plato={platoSeleccionado}
          onCerrar={() => setPlatoSeleccionado(null)}
        />
      )}

      <BotonChat />
    </div>
  );
}

function limpiarEmojis(texto) {
  return texto
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
    .trim();
}

function agruparPorCategoria(platos) {
  return platos.reduce((acc, plato) => {
    if (!acc[plato.categoria]) acc[plato.categoria] = [];
    acc[plato.categoria].push(plato);
    return acc;
  }, {});
}

const estilos = {
  header: { backgroundColor: "#E91E63", color: "#fff" },
  headerContenido: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1.2rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoArea: { display: "flex", alignItems: "center", gap: "12px" },
  logoTitulo: {
    fontFamily: tema.fuenteTitulo,
    fontSize: "1.6rem",
    fontWeight: "700",
    margin: 0,
    color: "#fff",
  },
  logoSub: {
    fontSize: "0.75rem",
    margin: 0,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  headerAcciones: { display: "flex", alignItems: "center", gap: "10px" },
  saludo: {
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.9)",
    marginRight: "8px",
  },
  btnHeader: {
    padding: "7px 16px",
    borderRadius: "6px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontFamily: tema.fuenteCuerpo,
  },
  instrucciones: {
    backgroundColor: "#3d3d3d",
    padding: "1.5rem 2rem",
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  instruccionItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.95)",
    lineHeight: "1.5",
  },
  instruccionNumero: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#E91E63",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: "700",
    flexShrink: 0,
  },
  contenedor: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "1.5rem",
    alignItems: "start",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  sidebar: { position: "sticky", top: "1.5rem" },
  filtrosTitulo: {
    backgroundColor: "#fff",
    borderRadius: "10px 10px 0 0",
    padding: "1rem 1.2rem 0.5rem",
    borderBottom: `2px solid ${tema.dorado}`,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1rem",
  },
  categoriaHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
  },
  categoriaTitulo: {
    fontFamily: tema.fuenteTitulo,
    fontSize: "1.2rem",
    fontWeight: "700",
    color: tema.negro,
    margin: 0,
    whiteSpace: "nowrap",
  },
  categoriaLinea: { flex: 1, height: "1px", backgroundColor: tema.dorado },
  estadoVacio: {
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "#fff",
    borderRadius: "12px",
  },
  btnLimpiar: {
    marginTop: "1rem",
    padding: "8px 20px",
    borderRadius: "6px",
    backgroundColor: tema.rojo,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
};
