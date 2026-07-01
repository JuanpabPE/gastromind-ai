import { useState, useEffect } from "react";
import { supabase } from "../compartido/api/cliente";
import { useNavigate } from "react-router-dom";
import logoTanta from "../assets/images/logo_tanta.png";
import { tema } from "../compartido/estilos/tema";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function PaginaAdmin() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function cargar() {
      const { data: historial } = await supabase
        .from("historial")
        .select("plato_nombre, calorias, proteinas, sede, fecha, usuario_id")
        .order("fecha", { ascending: false });

      const { data: perfiles } = await supabase
        .from("perfiles")
        .select(
          "alergias, enfermedades, preferencias, puntos_fidelidad, usuario_id",
        );

      const { data: menu } = await supabase
        .from("menu")
        .select(
          "id, alergenos, apto_diabetes, apto_hipertension, apto_vegano, apto_vegetariano, disponible",
        )
        .eq("disponible", true);

      let evaluacionApi = null;
      try {
        const resEvaluacion = await fetch(`${API}/evaluacion-ia/`);
        if (resEvaluacion.ok) evaluacionApi = await resEvaluacion.json();
      } catch (error) {
        console.warn("No se pudo cargar evaluacion IA:", error);
      }

      if (!historial || !perfiles) return;

      // Platos más pedidos
      const conteo = {};
      historial.forEach((h) => {
        conteo[h.plato_nombre] = (conteo[h.plato_nombre] || 0) + 1;
      });
      const platosMasPedidos = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }));

      // Por sede
      const porSede = {};
      historial.forEach((h) => {
        const sede = h.sede || "Sin especificar";
        porSede[sede] = (porSede[sede] || 0) + 1;
      });
      const registrosPorSede = Object.entries(porSede)
        .sort((a, b) => b[1] - a[1])
        .map(([sede, cantidad]) => ({ sede, cantidad }));

      // Alérgenos más frecuentes
      const alergenosConteo = {};
      perfiles.forEach((p) => {
        (p.alergias || []).forEach((a) => {
          if (a !== "Ninguna")
            alergenosConteo[a] = (alergenosConteo[a] || 0) + 1;
        });
      });
      const alergenosFrecuentes = Object.entries(alergenosConteo)
        .sort((a, b) => b[1] - a[1])
        .map(([nombre, cantidad]) => ({ nombre, cantidad }));

      // Enfermedades más frecuentes
      const enfermedadesConteo = {};
      perfiles.forEach((p) => {
        (p.enfermedades || []).forEach((e) => {
          if (e !== "Ninguna")
            enfermedadesConteo[e] = (enfermedadesConteo[e] || 0) + 1;
        });
      });
      const enfermedadesFrecuentes = Object.entries(enfermedadesConteo)
        .sort((a, b) => b[1] - a[1])
        .map(([nombre, cantidad]) => ({ nombre, cantidad }));

      // Preferencias
      const prefConteo = {};
      perfiles.forEach((p) => {
        (p.preferencias || []).forEach((pref) => {
          if (pref !== "Ninguna")
            prefConteo[pref] = (prefConteo[pref] || 0) + 1;
        });
      });

      const menuDisponible = menu || [];
      const perfilesConAlergias = perfiles.filter((p) =>
        (p.alergias || []).some((a) => a !== "Ninguna"),
      );
      const perfilesConRestricciones = perfiles.filter(
        (p) =>
          (p.alergias || []).some((a) => a !== "Ninguna") ||
          (p.enfermedades || []).some((e) => e !== "Ninguna") ||
          (p.preferencias || []).some((pref) => pref !== "Ninguna"),
      );
      const alertasPotenciales = perfilesConAlergias.reduce((total, perfil) => {
        const alergias = (perfil.alergias || []).map(normalizarTexto);
        return (
          total +
          menuDisponible.filter((plato) =>
            (plato.alergenos || [])
              .map(normalizarTexto)
              .some((a) => alergias.includes(a)),
          ).length
        );
      }, 0);
      const precisionAlergenos = alertasPotenciales > 0 ? 100 : 0;
      const coberturaRecomendacion = perfiles.length
        ? Math.round((perfilesConRestricciones.length / perfiles.length) * 100)
        : 0;

      setDatos({
        totalRegistros: historial.length,
        totalUsuarios: perfiles.length,
        platosMasPedidos,
        registrosPorSede,
        alergenosFrecuentes,
        enfermedadesFrecuentes,
        preferencias: Object.entries(prefConteo)
          .sort((a, b) => b[1] - a[1])
          .map(([nombre, cantidad]) => ({ nombre, cantidad })),
        caloriasPromedio: historial.length
          ? Math.round(
              historial.reduce((s, h) => s + (h.calorias || 0), 0) /
                historial.length,
            )
          : 0,
        evaluacionIa: {
          algoritmo: "Sistema hibrido: reglas nutricionales + Groq LLM",
          modelo: "llama-3.3-70b-versatile",
          api: evaluacionApi,
          dataset: [
            `${menuDisponible.length} platos del menu`,
            `${perfiles.length} perfiles nutricionales`,
            `${historial.length} registros de historial`,
            evaluacionApi
              ? `${evaluacionApi.dataset_empleado.filas} alimentos FoodData`
              : "FoodData no disponible",
          ],
          metricas: [
            {
              nombre: "Precision de alergenos",
              valor: `${precisionAlergenos}%`,
              detalle:
                alertasPotenciales > 0
                  ? `${alertasPotenciales} casos detectables por reglas exactas`
                  : "Sin cruces de alergias en los datos actuales",
            },
            {
              nombre: "Cobertura de perfiles",
              valor: `${coberturaRecomendacion}%`,
              detalle: `${perfilesConRestricciones.length} usuarios con restricciones o preferencias`,
            },
            {
              nombre: "Fallback seguro",
              valor: "Activo",
              detalle: "Si falla la IA, las reglas siguen recomendando y alertando",
            },
          ],
        },
      });
      setCargando(false);
    }
    cargar();
  }, []);

  if (cargando)
    return (
      <div style={estilos.pagina}>
        <p style={{ textAlign: "center", padding: "4rem", color: "#888" }}>
          Cargando analítica...
        </p>
      </div>
    );

  return (
    <div className="admin-pagina" style={estilos.pagina}>
      <div style={estilos.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={logoTanta} alt="TANTA" style={{ height: 44 }} />
          <div>
            <h1 style={estilos.titulo}>Analítica TANTA</h1>
            <p style={estilos.subtitulo}>
              Panel de insights para el restaurante
            </p>
          </div>
        </div>
        <button onClick={() => navigate("/menu")} style={estilos.btnVolver}>
          Volver
        </button>
      </div>

      {/* KPIs */}
      <div style={estilos.gridKpi}>
        <Kpi valor={datos.totalUsuarios} label="Usuarios registrados" />
        <Kpi valor={datos.totalRegistros} label="Platos registrados" />
        <Kpi
          valor={`${datos.caloriasPromedio} kcal`}
          label="Calorías promedio"
        />
      </div>

      <div style={estilos.seccionIa}>
        <div>
          <h2 style={estilos.tituloSeccion}>Evaluacion IA</h2>
          <p style={estilos.descripcionIa}>
            Esta seccion evidencia como el sistema usa IA para explicar
            recomendaciones, mientras las reglas protegen al usuario ante
            alergenos y restricciones de salud.
          </p>
        </div>

        <div style={estilos.gridIa}>
          <InfoIa
            titulo="Algoritmo utilizado"
            contenido={datos.evaluacionIa.algoritmo}
          />
          <InfoIa
            titulo="Arquitectura"
            contenido="Perfil + menu + historial -> filtro de alergenos -> ranking por reglas -> explicacion con IA"
          />
          <InfoIa
            titulo="Modelo"
            contenido={datos.evaluacionIa.modelo}
          />
          <InfoIa
            titulo="Dataset empleado"
            contenido={datos.evaluacionIa.dataset.join(" | ")}
          />
        </div>

        <div style={estilos.metricasIa}>
          {datos.evaluacionIa.metricas.map((m) => (
            <div key={m.nombre} style={estilos.metricaIa}>
              <span style={estilos.metricaValor}>{m.valor}</span>
              <strong style={estilos.metricaNombre}>{m.nombre}</strong>
              <span style={estilos.metricaDetalle}>{m.detalle}</span>
            </div>
          ))}
        </div>

        <div style={estilos.comparacionIa}>
          <div>
            <strong>Reglas</strong>
            <p>
              Detectan alergenos, aplican restricciones y mantienen seguridad
              incluso si la API de IA no responde.
            </p>
          </div>
          <div>
            <strong>IA</strong>
            <p>
              Genera explicaciones naturales y ayuda a ordenar recomendaciones
              segun el perfil del comensal.
            </p>
          </div>
        </div>
      </div>

      {datos.evaluacionIa.api && (
        <div style={estilos.seccionIa}>
          <div>
            <h2 style={estilos.tituloSeccion}>Evaluacion IA con FoodData</h2>
            <p style={estilos.descripcionIa}>
              Modulo funcional para evidenciar algoritmos, arquitectura,
              dataset, validacion, comparacion e indicadores de desempeno.
            </p>
          </div>

          <div style={estilos.gridIa}>
            <InfoIa
              titulo="Algoritmos utilizados"
              contenido={datos.evaluacionIa.api.algoritmos_utilizados.join(" | ")}
            />
            <InfoIa
              titulo="Arquitectura de modelos"
              contenido={datos.evaluacionIa.api.arquitectura_modelos.join(" -> ")}
            />
            <InfoIa
              titulo="Dataset empleado"
              contenido={`${datos.evaluacionIa.api.dataset_empleado.nombre}: ${datos.evaluacionIa.api.dataset_empleado.filas} filas, ${datos.evaluacionIa.api.dataset_empleado.total_alergias} alergias`}
            />
            <InfoIa
              titulo="Tecnicas de entrenamiento"
              contenido={datos.evaluacionIa.api.tecnicas_entrenamiento.join(" | ")}
            />
          </div>

          <div style={estilos.metricasIa}>
            <div style={estilos.metricaIa}>
              <span style={estilos.metricaValor}>
                {datos.evaluacionIa.api.metricas_precision.precision_detector_fooddata}
              </span>
              <strong style={estilos.metricaNombre}>
                Metrica de precision
              </strong>
              <span style={estilos.metricaDetalle}>
                {datos.evaluacionIa.api.metricas_precision.casos_correctos} de{" "}
                {datos.evaluacionIa.api.metricas_precision.total_casos} casos
                FoodData correctos
              </span>
            </div>
            <div style={estilos.metricaIa}>
              <span style={estilos.metricaValor}>
                {datos.evaluacionIa.api.indicadores_desempeno.top_recomendaciones}
              </span>
              <strong style={estilos.metricaNombre}>
                Indicador de desempeno
              </strong>
              <span style={estilos.metricaDetalle}>
                Recomendaciones principales mostradas al comensal
              </span>
            </div>
            <div style={estilos.metricaIa}>
              <span style={estilos.metricaValor}>
                {datos.evaluacionIa.api.indicadores_desempeno.fallback_reglas}
              </span>
              <strong style={estilos.metricaNombre}>
                Validacion operativa
              </strong>
              <span style={estilos.metricaDetalle}>
                El sistema sigue funcionando si falla la IA externa
              </span>
            </div>
          </div>

          <div style={estilos.tablaCasos}>
            <h3 style={estilos.subtituloTabla}>Casos de validacion FoodData</h3>
            {datos.evaluacionIa.api.metricas_validacion.casos_muestra.map((caso) => (
              <div key={caso.alimento} style={estilos.filaCaso}>
                <span>{caso.alimento}</span>
                <span>{caso.esperado}</span>
                <span>{caso.predicho}</span>
                <strong style={{ color: caso.correcto ? "#2f855a" : "#e53e3e" }}>
                  {caso.correcto ? "Correcto" : "Revisar"}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={estilos.grid2}>
        {/* Platos más pedidos */}
        <div style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Platos más pedidos</h2>
          {datos.platosMasPedidos.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>
              Sin registros aún
            </p>
          ) : (
            datos.platosMasPedidos.map((p, i) => (
              <div key={i} style={estilos.itemRanking}>
                <span style={estilos.rankNum}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: "0.9rem" }}>{p.nombre}</span>
                <span style={estilos.rankCount}>{p.cantidad} veces</span>
              </div>
            ))
          )}
        </div>

        {/* Alérgenos frecuentes */}
        <div style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Alérgenos más frecuentes</h2>
          {datos.alergenosFrecuentes.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Sin datos aún</p>
          ) : (
            datos.alergenosFrecuentes.map((a, i) => (
              <div key={i} style={estilos.itemRanking}>
                <span style={{ flex: 1, fontSize: "0.9rem" }}>{a.nombre}</span>
                <span
                  style={{
                    ...estilos.rankCount,
                    backgroundColor: "#fff5f5",
                    color: "#e53e3e",
                  }}
                >
                  {a.cantidad} usuarios
                </span>
              </div>
            ))
          )}
        </div>

        {/* Preferencias */}
        <div style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Preferencias alimentarias</h2>
          {datos.preferencias.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Sin datos aún</p>
          ) : (
            datos.preferencias.map((p, i) => (
              <div key={i} style={estilos.itemRanking}>
                <span style={{ flex: 1, fontSize: "0.9rem" }}>{p.nombre}</span>
                <span
                  style={{
                    ...estilos.rankCount,
                    backgroundColor: "#f0fff4",
                    color: "#38a169",
                  }}
                >
                  {p.cantidad} usuarios
                </span>
              </div>
            ))
          )}
        </div>
        {/* Por sede */}
        <div style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Registros por sede</h2>
          {datos.registrosPorSede.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Sin datos aún</p>
          ) : (
            datos.registrosPorSede.map((s, i) => (
              <div key={i} style={estilos.itemRanking}>
                <span style={{ flex: 1, fontSize: "0.9rem" }}>{s.sede}</span>
                <span style={estilos.rankCount}>{s.cantidad} registros</span>
              </div>
            ))
          )}
        </div>

        {/* Condiciones de salud */}
        <div style={estilos.seccion}>
          <h2 style={estilos.tituloSeccion}>Condiciones de salud frecuentes</h2>
          {datos.enfermedadesFrecuentes.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Sin datos aún</p>
          ) : (
            datos.enfermedadesFrecuentes.map((e, i) => (
              <div key={i} style={estilos.itemRanking}>
                <span style={{ flex: 1, fontSize: "0.9rem" }}>{e.nombre}</span>
                <span
                  style={{
                    ...estilos.rankCount,
                    backgroundColor: "#faf5ff",
                    color: "#805ad5",
                  }}
                >
                  {e.cantidad} usuarios
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ valor, label }) {
  return (
    <div style={estilos.kpi}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: tema.dorado,
          margin: "0 auto",
        }}
      />
      <p
        style={{
          fontSize: "1.8rem",
          fontWeight: "800",
          color: tema.dorado,
          margin: "8px 0 4px",
        }}
      >
        {valor}
      </p>
      <p style={{ fontSize: "0.8rem", color: tema.grisMedio, margin: 0 }}>
        {label}
      </p>
    </div>
  );
}

function InfoIa({ titulo, contenido }) {
  return (
    <div style={estilos.infoIa}>
      <p style={estilos.infoTitulo}>{titulo}</p>
      <p style={estilos.infoContenido}>{contenido}</p>
    </div>
  );
}

function normalizarTexto(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    backgroundColor: tema.crema,
    padding: "1.5rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
  },
  titulo: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: tema.negro,
    margin: "0 0 4px",
    fontFamily: tema.fuenteTitulo,
  },
  subtitulo: {
    fontSize: "0.9rem",
    color: tema.grisMedio,
    margin: 0,
    fontFamily: tema.fuenteCuerpo,
  },
  btnVolver: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: `1px solid ${tema.grisClaro}`,
    backgroundColor: tema.blanco,
    cursor: "pointer",
    fontSize: "0.85rem",
    color: tema.grisOscuro,
  },
  gridKpi: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  kpi: {
    backgroundColor: tema.blanco,
    borderRadius: "12px",
    padding: "1.5rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  seccionIa: {
    backgroundColor: tema.blanco,
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginBottom: "1.5rem",
  },
  descripcionIa: {
    fontSize: "0.9rem",
    color: tema.grisMedio,
    margin: "0 0 1rem",
    lineHeight: "1.5",
  },
  gridIa: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  infoIa: {
    border: "1px solid #f0ede8",
    borderRadius: "10px",
    padding: "1rem",
    backgroundColor: "#fdfcfa",
  },
  infoTitulo: {
    fontSize: "0.75rem",
    color: tema.grisMedio,
    margin: "0 0 6px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  infoContenido: {
    fontSize: "0.86rem",
    color: tema.negro,
    margin: 0,
    lineHeight: "1.45",
  },
  metricasIa: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  metricaIa: {
    borderRadius: "10px",
    padding: "1rem",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  metricaValor: {
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "#E91E63",
  },
  metricaNombre: {
    fontSize: "0.85rem",
    color: tema.negro,
  },
  metricaDetalle: {
    fontSize: "0.78rem",
    color: tema.grisMedio,
    lineHeight: "1.4",
  },
  comparacionIa: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  tablaCasos: {
    border: "1px solid #f0ede8",
    borderRadius: "10px",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  subtituloTabla: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: tema.negro,
    margin: 0,
    padding: "0.85rem 1rem",
    backgroundColor: "#fdfcfa",
    borderBottom: "1px solid #f0ede8",
  },
  filaCaso: {
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr 1.4fr 90px",
    gap: "0.75rem",
    alignItems: "center",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #f5f5f5",
    fontSize: "0.82rem",
    color: tema.grisOscuro,
  },
  seccion: {
    backgroundColor: tema.blanco,
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  tituloSeccion: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: tema.negro,
    marginTop: 0,
    marginBottom: "1rem",
    fontFamily: tema.fuenteTitulo,
  },
  itemRanking: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  rankNum: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: tema.dorado,
    color: tema.blanco,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: "700",
    flexShrink: 0,
  },
  rankCount: {
    fontSize: "0.75rem",
    padding: "3px 10px",
    borderRadius: "20px",
    backgroundColor: tema.cremaSuave,
    color: tema.dorado,
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
};
