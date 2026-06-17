import { useState, useEffect } from "react";
import {
  obtenerHistorial,
  obtenerResumen,
} from "../historial_consumo/historialApi";
import { useNavigate } from "react-router-dom";
import BotonChat from "../chatbot_nutricionista/botonChat";
import TarjetaPuntos from "../fidelizacion/tarjetaPuntos";
import { tema } from "../compartido/estilos/tema";
import logoTanta from "../assets/images/logo_tanta.png";

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
        <p
          style={{
            color: tema.grisMedio,
            textAlign: "center",
            padding: "4rem",
          }}
        >
          Cargando tu dashboard...
        </p>
      </div>
    );

  // Agrupa historial por fecha (día)
  const porDia = agruparPorDia(historial);

  return (
    <div style={estilos.pagina}>
      {/* Header */}
      <div style={estilos.header}>
        <div style={estilos.headerContenido}>
          <div style={estilos.logoArea}>
            <img
              src={logoTanta}
              alt="TANTA Logo"
              style={{ height: "48px", width: "auto" }}
            />
            <div>
              <h1 style={estilos.logoTitulo}>Tanta</h1>
              <p style={estilos.logoSub}>Dashboard Nutricional</p>
            </div>
          </div>
          <button onClick={() => navigate("/menu")} style={estilos.btnVolver}>
            Volver al menu
          </button>
        </div>
      </div>

      <div style={estilos.contenedor}>
        {/* Fidelizacion */}
        <TarjetaPuntos />

        {/* Tarjetas resumen */}
        <div style={estilos.gridResumen}>
          <TarjetaResumen
            valor={resumen?.total_visitas || 0}
            label="Platos registrados"
          />
          <TarjetaResumen
            valor={`${resumen?.calorias_promedio || 0} kcal`}
            label="Promedio por plato"
          />
          <TarjetaResumen
            valor={`${resumen?.calorias_total || 0} kcal`}
            label="Total consumido"
          />
        </div>

        {/* Grafico por dia */}
        {Object.keys(porDia).length > 0 && (
          <div style={estilos.seccion}>
            <h2 style={estilos.tituloSeccion}>Calorias por dia</h2>
            <GraficoPorDia porDia={porDia} />
          </div>
        )}

        {/* Historial */}
        <div style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Historial de platos</h2>
          {historial.length === 0 ? (
            <div style={estilos.vacio}>
              <p style={{ color: tema.grisMedio }}>
                Aun no has registrado ningun plato.
              </p>
              <button
                onClick={() => navigate("/menu")}
                style={estilos.btnIrMenu}
              >
                Explorar el menu
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
                    <p style={estilos.itemSede}>{item.sede}</p>
                  </div>
                  <div style={estilos.itemNutri}>
                    <span
                      style={{
                        ...estilos.nutriBadge,
                        backgroundColor: "#fff8ee",
                        color: tema.dorado,
                      }}
                    >
                      {item.calorias} kcal
                    </span>
                    <span
                      style={{
                        ...estilos.nutriBadge,
                        backgroundColor: "#f0fff4",
                        color: tema.verde,
                      }}
                    >
                      {item.proteinas}g prot
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BotonChat />
    </div>
  );
}

function agruparPorDia(historial) {
  const grupos = {};
  historial.forEach((item) => {
    const dia = new Date(item.fecha).toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
    });
    if (!grupos[dia]) grupos[dia] = 0;
    grupos[dia] += item.calorias || 0;
  });
  return grupos;
}

function GraficoPorDia({ porDia }) {
  const entradas = Object.entries(porDia).slice(-10);
  const maxCal = Math.max(...entradas.map(([, v]) => v));

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
          height: "140px",
          padding: "0 4px",
          marginBottom: "8px",
        }}
      >
        {entradas.map(([dia, calorias], i) => {
          const altura = maxCal > 0 ? (calorias / maxCal) * 100 : 0;
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
              <span
                style={{
                  fontSize: "0.7rem",
                  color: tema.grisMedio,
                  fontWeight: "600",
                }}
              >
                {calorias}
              </span>
              <div
                title={`${dia}: ${calorias} kcal`}
                style={{
                  width: "100%",
                  height: `${altura}%`,
                  backgroundColor: tema.rojo,
                  borderRadius: "4px 4px 0 0",
                  minHeight: "4px",
                  transition: "height 0.3s",
                }}
              />
              <span
                style={{
                  fontSize: "0.65rem",
                  color: tema.grisMedio,
                  textAlign: "center",
                }}
              >
                {dia}
              </span>
            </div>
          );
        })}
      </div>
      <p
        style={{
          fontSize: "0.75rem",
          color: tema.grisMedio,
          margin: 0,
          textAlign: "right",
        }}
      >
        Calorias totales por dia de visita
      </p>
    </div>
  );
}

function TarjetaResumen({ valor, label }) {
  return (
    <div style={estilos.tarjetaResumen}>
      <p
        style={{
          fontSize: "1.8rem",
          fontWeight: "700",
          color: tema.rojo,
          margin: "0 0 4px",
          fontFamily: tema.fuenteTitulo,
        }}
      >
        {valor}
      </p>
      <p style={{ fontSize: "0.82rem", color: tema.grisMedio, margin: 0 }}>
        {label}
      </p>
    </div>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    backgroundColor: tema.cremaSuave,
    fontFamily: tema.fuenteCuerpo,
  },
  header: { backgroundColor: tema.rojo },
  headerContenido: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "1.2rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoArea: { display: "flex", alignItems: "center", gap: "12px" },
  logoCirculo: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    color: tema.rojo,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: tema.fuenteTitulo,
    fontWeight: "800",
    fontSize: "1.2rem",
  },
  logoTitulo: {
    fontFamily: tema.fuenteTitulo,
    fontSize: "1.4rem",
    fontWeight: "700",
    margin: 0,
    color: "#fff",
  },
  logoSub: {
    fontSize: "0.72rem",
    margin: 0,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  btnVolver: {
    padding: "7px 16px",
    borderRadius: "6px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontFamily: tema.fuenteCuerpo,
  },
  contenedor: { maxWidth: "900px", margin: "0 auto", padding: "2rem" },
  gridResumen: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  tarjetaResumen: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "1.5rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    borderTop: `3px solid ${tema.dorado}`,
  },
  seccion: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  tituloSeccion: {
    fontFamily: tema.fuenteTitulo,
    fontSize: "1rem",
    fontWeight: "700",
    color: tema.negro,
    marginTop: 0,
    marginBottom: "1.2rem",
    paddingBottom: "8px",
    borderBottom: `1px solid ${tema.grisClaro}`,
  },
  vacio: { textAlign: "center", padding: "2rem" },
  btnIrMenu: {
    marginTop: "1rem",
    padding: "8px 20px",
    borderRadius: "6px",
    backgroundColor: tema.rojo,
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
    borderRadius: "8px",
    backgroundColor: tema.cremaSuave,
    border: `1px solid ${tema.grisClaro}`,
    gap: "12px",
  },
  itemInfo: { flex: 1 },
  itemNombre: {
    margin: "0 0 4px",
    fontWeight: "600",
    fontSize: "0.9rem",
    color: tema.negro,
  },
  itemFecha: { margin: "0 0 2px", fontSize: "0.78rem", color: tema.grisMedio },
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
