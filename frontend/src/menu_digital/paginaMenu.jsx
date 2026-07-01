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
  const {
    platos,
    cargando,
    filtros,
    setFiltros,
    tieneAlergeno,
    alertasPorPlato,
  } = useMenu();
  const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [esMozo, setEsMozo] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [codigoCliente, setCodigoCliente] = useState("");
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
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
        .select("nombre, es_admin, es_mozo, codigo_cliente")
        .eq("usuario_id", user.id)
        .single();
      setEsAdmin(data?.es_admin || false);
      setEsMozo(data?.es_mozo || false);
      setNombreUsuario(data?.nombre?.split(" ")[0] || "");
      setCodigoCliente(data?.codigo_cliente || "");
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
      <div style={{ backgroundColor: "#E91E63", color: "#fff" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={logoTanta}
              alt="TANTA Logo"
              style={{ height: "40px", width: "auto" }}
            />
            <div>
              <h1
                style={{
                  fontFamily: tema.fuenteTitulo,
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  margin: 0,
                  color: "#fff",
                }}
              >
                Tanta
              </h1>
              <p
                style={{
                  fontSize: "0.65rem",
                  margin: 0,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Carta Digital
              </p>
            </div>
          </div>

          {/* Desktop nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
            className="menu-header-acciones"
          >
            {nombreUsuario && (
              <span
                style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.9)" }}
              >
                {nombreUsuario} ·{" "}
                <span style={{ fontFamily: "monospace" }}>
                  #{codigoCliente}
                </span>
              </span>
            )}
            <button
              onClick={() => navigate("/dashboard")}
              style={estilos.btnHeader}
            >
              Mi Dashboard
            </button>
            {esAdmin && (
              <button
                onClick={() => navigate("/evaluacion-ia")}
                style={estilos.btnHeader}
              >
                Evaluacion IA
              </button>
            )}
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
                Admin
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            style={{
              display: "none",
              background: "none",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "#fff",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
            className="menu-hamburger"
          >
            ☰
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuAbierto && (
          <div
            style={{
              backgroundColor: "#c2185b",
              padding: "1rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
            className="menu-mobile-nav"
          >
            {nombreUsuario && (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.9)",
                  paddingBottom: "8px",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {nombreUsuario} ·{" "}
                <span style={{ fontFamily: "monospace" }}>
                  #{codigoCliente}
                </span>
              </span>
            )}
            <button
              onClick={() => {
                navigate("/dashboard");
                setMenuAbierto(false);
              }}
              style={estilos.btnMobile}
            >
              Mi Dashboard
            </button>
            <button
              onClick={() => {
                navigate("/evaluacion-ia");
                setMenuAbierto(false);
              }}
              style={estilos.btnMobile}
            >
              Evaluacion IA
            </button>
            {esMozo && (
              <button
                onClick={() => {
                  navigate("/mozo");
                  setMenuAbierto(false);
                }}
                style={estilos.btnMobile}
              >
                Panel Mozo
              </button>
            )}
            {esAdmin && (
              <button
                onClick={() => {
                  navigate("/admin");
                  setMenuAbierto(false);
                }}
                style={estilos.btnMobile}
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              style={{
                ...estilos.btnMobile,
                backgroundColor: "#C2185B",
                borderColor: "#C2185B",
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        )}

        {/* Instrucciones */}
        <div
          style={{ backgroundColor: "#3d3d3d", padding: "1rem 1.5rem" }}
          className="menu-instrucciones"
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              "Revisa tus recomendaciones personalizadas según tu perfil de salud",
              "Usa los filtros para explorar la carta por categoría, calorías o proteínas",
              "Haz clic en cualquier plato para ver su ficha nutricional completa",
              "Consulta al nutricionista virtual si tienes dudas sobre algún plato",
            ].map((texto, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.95)",
                  lineHeight: "1.5",
                }}
              >
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: "#E91E63",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span>{texto}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="menu-contenedor"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}
      >
        {/* Recomendaciones */}
        <PanelRecomendaciones onVerFicha={setPlatoSeleccionado} />

        <div style={estilos.layout} className="menu-layout">
          {/* Sidebar */}
          <div style={estilos.sidebar} className="menu-sidebar">
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px 10px 0 0",
                padding: "1rem 1.2rem 0.5rem",
                borderBottom: `2px solid ${tema.dorado}`,
              }}
            >
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
              <div className="menu-grid-platos" style={estilos.grid}>
                {platos.map((plato) => (
                  <TarjetaPlato
                    key={plato.id}
                    plato={plato}
                    tieneAlergeno={tieneAlergeno}
                    alerta={alertasPorPlato[plato.id]}
                    onClick={() => setPlatoSeleccionado(plato)}
                  />
                ))}
              </div>
            ) : (
              Object.entries(platosPorCategoria).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: "2.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: tema.fuenteTitulo,
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        color: tema.negro,
                        margin: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {limpiarEmojis(cat)}
                    </h2>
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        backgroundColor: tema.dorado,
                      }}
                    />
                  </div>
                  <div className="menu-grid-platos" style={estilos.grid}>
                    {items.map((plato) => (
                      <TarjetaPlato
                        key={plato.id}
                        plato={plato}
                        tieneAlergeno={tieneAlergeno}
                        alerta={alertasPorPlato[plato.id]}
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
  btnHeader: {
    padding: "7px 14px",
    borderRadius: "6px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontFamily: tema.fuenteCuerpo,
  },
  btnMobile: {
    padding: "10px 16px",
    borderRadius: "8px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: "0.9rem",
    textAlign: "left",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "1.5rem",
    alignItems: "start",
  },
  sidebar: { position: "sticky", top: "1.5rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "1rem",
  },
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
