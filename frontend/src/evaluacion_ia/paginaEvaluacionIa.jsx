import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tema } from "../compartido/estilos/tema";
import logoTanta from "../assets/images/logo_tanta.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function PaginaEvaluacionIa() {
  const [evaluacion, setEvaluacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function cargarEvaluacion() {
      try {
        const respuesta = await fetch(`${API}/evaluacion-ia/`);
        if (!respuesta.ok) {
          throw new Error("No se pudo cargar la evaluacion IA");
        }
        setEvaluacion(await respuesta.json());
      } catch (err) {
        setError(err.message || "No se pudo cargar la evaluacion IA");
      } finally {
        setCargando(false);
      }
    }

    cargarEvaluacion();
  }, []);

  return (
    <div className="evaluacion-pagina" style={estilos.pagina}>
      <header className="evaluacion-header" style={estilos.header}>
        <div className="evaluacion-marca" style={estilos.marca}>
          <img src={logoTanta} alt="TANTA" style={estilos.logo} />
          <div>
            <h1 style={estilos.titulo}>Evaluacion IA con FoodData</h1>
            <p style={estilos.subtitulo}>
              Validacion del detector de alergenos y uso del dataset.
            </p>
          </div>
        </div>
        <button onClick={() => navigate("/menu")} style={estilos.btnVolver}>
          Volver al menu
        </button>
      </header>

      {cargando && (
        <div style={estilos.estado}>
          <p>Cargando evaluacion...</p>
        </div>
      )}

      {!cargando && error && (
        <div style={estilos.estado}>
          <strong>No disponible</strong>
          <p>{error}</p>
        </div>
      )}

      {!cargando && evaluacion && (
        <>
          <section className="evaluacion-panel" style={estilos.panel}>
            <div>
              <h2 style={estilos.tituloSeccion}>Resumen del dataset</h2>
              <p style={estilos.descripcion}>
                FoodData se usa como base de conocimiento para detectar
                posibles riesgos alimentarios y validar el comportamiento del
                detector.
              </p>
            </div>

            <div className="evaluacion-grid" style={estilos.gridMetricas}>
              <Metrica
                valor={evaluacion.dataset_empleado.filas}
                titulo="Casos FoodData"
                detalle={evaluacion.dataset_empleado.nombre}
              />
              <Metrica
                valor={evaluacion.metricas_precision.casos_correctos}
                titulo="Casos correctos"
                detalle={`${evaluacion.metricas_precision.total_casos} casos evaluados`}
              />
              <Metrica
                valor={evaluacion.metricas_precision.precision_detector_fooddata}
                titulo="Precision"
                detalle="Validacion con alimentos del CSV"
              />
            </div>
          </section>

          <section className="evaluacion-panel" style={estilos.panel}>
            <h2 style={estilos.tituloSeccion}>Como funciona</h2>
            <div className="evaluacion-grid" style={estilos.gridInfo}>
              <Info
                titulo="Algoritmos utilizados"
                contenido={evaluacion.algoritmos_utilizados.join(" | ")}
              />
              <Info
                titulo="Arquitectura del modelo"
                contenido={evaluacion.arquitectura_modelos.join(" -> ")}
              />
              <Info
                titulo="Tecnicas usadas"
                contenido={evaluacion.tecnicas_entrenamiento.join(" | ")}
              />
              <Info
                titulo="Indicadores de desempeno"
                contenido={`Fallback: ${evaluacion.indicadores_desempeno.fallback_reglas} | Revision: ${evaluacion.indicadores_desempeno.revision_alergenos}`}
              />
            </div>
          </section>

          <section className="evaluacion-panel" style={estilos.panel}>
            <h2 style={estilos.tituloSeccion}>Resultados comparativos</h2>
            <div className="evaluacion-grid" style={estilos.comparacion}>
              {evaluacion.resultados_comparativos.map((item) => (
                <div key={item.metodo} style={estilos.itemComparacion}>
                  <strong>{item.metodo}</strong>
                  <p>{item.resultado}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="evaluacion-panel" style={estilos.panel}>
            <h2 style={estilos.tituloSeccion}>Casos de validacion</h2>
            <div className="evaluacion-tabla" style={estilos.tabla}>
              {evaluacion.metricas_validacion.casos_muestra.map((caso) => (
                <div className="evaluacion-fila" key={caso.alimento} style={estilos.fila}>
                  <span>{caso.alimento}</span>
                  <span>{caso.esperado}</span>
                  <span>{caso.predicho}</span>
                  <strong style={{ color: caso.correcto ? tema.verde : tema.rojo }}>
                    {caso.correcto ? "Correcto" : "Revisar"}
                  </strong>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Metrica({ valor, titulo, detalle }) {
  return (
    <div style={estilos.metrica}>
      <span style={estilos.valor}>{valor}</span>
      <strong style={estilos.nombreMetrica}>{titulo}</strong>
      <span style={estilos.detalle}>{detalle}</span>
    </div>
  );
}

function Info({ titulo, contenido }) {
  return (
    <div style={estilos.info}>
      <p style={estilos.infoTitulo}>{titulo}</p>
      <p style={estilos.infoContenido}>{contenido}</p>
    </div>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    backgroundColor: tema.cremaSuave,
    padding: "1.5rem",
    fontFamily: tema.fuenteCuerpo,
  },
  header: {
    maxWidth: "1100px",
    margin: "0 auto 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  marca: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    height: 44,
    width: "auto",
  },
  titulo: {
    fontSize: "1.7rem",
    margin: "0 0 4px",
    color: tema.negro,
    fontFamily: tema.fuenteTitulo,
  },
  subtitulo: {
    margin: 0,
    color: tema.grisMedio,
    fontSize: "0.9rem",
  },
  btnVolver: {
    padding: "9px 16px",
    borderRadius: "8px",
    border: `1px solid ${tema.grisClaro}`,
    backgroundColor: tema.blanco,
    color: tema.grisOscuro,
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  panel: {
    maxWidth: "1100px",
    margin: "0 auto 1rem",
    backgroundColor: tema.blanco,
    borderRadius: "10px",
    padding: "1.25rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  tituloSeccion: {
    fontSize: "1rem",
    margin: "0 0 0.75rem",
    color: tema.negro,
    fontFamily: tema.fuenteTitulo,
  },
  descripcion: {
    color: tema.grisMedio,
    fontSize: "0.9rem",
    lineHeight: "1.5",
    margin: "0 0 1rem",
  },
  estado: {
    maxWidth: "1100px",
    margin: "0 auto",
    backgroundColor: tema.blanco,
    borderRadius: "10px",
    padding: "2rem",
    color: tema.grisMedio,
    textAlign: "center",
  },
  gridMetricas: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "0.75rem",
  },
  metrica: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
    padding: "1rem",
  },
  valor: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#E91E63",
  },
  nombreMetrica: {
    fontSize: "0.9rem",
    color: tema.negro,
  },
  detalle: {
    fontSize: "0.8rem",
    color: tema.grisMedio,
  },
  gridInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "0.75rem",
  },
  info: {
    border: "1px solid #f0ede8",
    borderRadius: "8px",
    padding: "1rem",
    backgroundColor: "#fdfcfa",
  },
  infoTitulo: {
    margin: "0 0 6px",
    color: tema.grisMedio,
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  infoContenido: {
    margin: 0,
    color: tema.negro,
    fontSize: "0.86rem",
    lineHeight: "1.45",
  },
  comparacion: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "0.75rem",
  },
  itemComparacion: {
    border: "1px solid #f0ede8",
    borderRadius: "8px",
    padding: "1rem",
  },
  tabla: {
    border: "1px solid #f0ede8",
    borderRadius: "8px",
    overflow: "hidden",
  },
  fila: {
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr 1.4fr 90px",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #f5f5f5",
    color: tema.grisOscuro,
    fontSize: "0.82rem",
    alignItems: "center",
  },
};
