import { useState, useEffect } from "react";
import { supabase } from "../compartido/api/cliente";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function FichaNutricional({ plato, onCerrar }) {
  const [alerta, setAlerta] = useState(null);
  const [analizando, setAnalizando] = useState(false);

  useEffect(() => {
    let activo = true;

    async function verificarConReglasLocales(user) {
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("alergias, enfermedades")
        .eq("usuario_id", user.id)
        .single();

      if (!perfil || !activo) return;

      const alergenos = plato.alergenos || [];
      const alergias = (perfil.alergias || []).map((a) => a.toLowerCase());
      const encontrados = alergenos.filter((a) =>
        alergias.includes(a.toLowerCase()),
      );

      if (encontrados.length > 0) {
        setAlerta({
          tipo: "peligro",
          mensaje: `Este plato contiene ${encontrados.join(", ")}; ingredientes que debes evitar segun tu perfil.`,
          advertencias: [{
            tipo: "alergeno",
            nivel: "peligro",
            mensaje: `Este plato contiene ${encontrados.join(", ")}; ingredientes que debes evitar segun tu perfil.`,
          }],
        });
        return;
      }

      if (
        perfil.enfermedades?.includes("Diabetes") &&
        plato.carbohidratos > 60
      ) {
        setAlerta({
          tipo: "precaucion",
          mensaje: `Este plato tiene ${plato.carbohidratos}g de carbohidratos. Consumelo con moderacion si tienes diabetes.`,
          advertencias: [{
            tipo: "diabetes",
            nivel: "precaucion",
            mensaje: `Este plato tiene ${plato.carbohidratos}g de carbohidratos. Consumelo con moderacion si tienes diabetes.`,
          }],
        });
        return;
      }

      if (perfil.enfermedades?.includes("Hipertension") && plato.grasas > 25) {
        setAlerta({
          tipo: "precaucion",
          mensaje:
            "Este plato puede ser alto en sodio. Consumelo con moderacion si tienes hipertension.",
          advertencias: [{
            tipo: "hipertension",
            nivel: "precaucion",
            mensaje:
              "Este plato puede ser alto en sodio. Consumelo con moderacion si tienes hipertension.",
          }],
        });
      }
    }

    async function verificar() {
      setAlerta(null);
      setAnalizando(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (activo) setAnalizando(false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          const response = await fetch(`${API}/alertas/${plato.id}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          if (response.ok) {
            const data = await response.json();
            const advertencias = data?.advertencias || [];
            const hayPeligro = advertencias.some((a) => a.nivel === "peligro");

            if (activo && advertencias.length > 0) {
              setAlerta({
                tipo: hayPeligro ? "peligro" : "precaucion",
                mensaje: advertencias
                  .map((a) => a.mensaje)
                  .filter(Boolean)
                  .join(" "),
                advertencias,
              });
            }
            return;
          }
        }

        await verificarConReglasLocales(user);
      } catch (error) {
        console.warn("No se pudo consultar la alerta con IA:", error);
        await verificarConReglasLocales(user);
      } finally {
        if (activo) setAnalizando(false);
      }
    }

    verificar();

    return () => {
      activo = false;
    };
  }, [plato]);

  return (
    <div style={estilos.overlay} onClick={onCerrar}>
      <div
        className="ficha-modal"
        style={estilos.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onCerrar} style={estilos.cerrar}>
          x
        </button>

        <div className="ficha-contenido" style={estilos.contenidoScrolleable}>
          {analizando && !alerta && (
            <div style={estilos.analizando}>
              Analizando compatibilidad nutricional...
            </div>
          )}

          {alerta && (
            <div
              style={{
                ...estilos.alerta,
                ...(alerta.tipo === "peligro"
                  ? estilos.alertaPeligro
                  : estilos.alertaPrecaucion),
              }}
            >
              {(alerta.advertencias || [{ tipo: "alerta", mensaje: alerta.mensaje }]).map(
                (advertencia, index) => (
                  <div
                    className="ficha-alerta-item"
                    key={`${advertencia.tipo}-${index}`}
                    style={estilos.alertaItem}
                  >
                    <strong style={estilos.alertaFuente}>
                      {nombreFuente(advertencia.tipo)}
                    </strong>
                    <span>{advertencia.mensaje}</span>
                  </div>
                ),
              )}
            </div>
          )}

          <h2 style={estilos.nombre}>{plato.nombre}</h2>
          <p style={estilos.descripcion}>{plato.descripcion}</p>
          <p style={estilos.precio}>S/. {plato.precio}</p>

          <div style={estilos.seccion}>
            <h3 style={estilos.tituloSeccion}>Informacion nutricional</h3>
            <div className="ficha-grid-nutri" style={estilos.gridNutri}>
              <Nutriente
                label="Calorias"
                valor={plato.calorias}
                unidad="kcal"
                color="#c8a96e"
              />
              <Nutriente
                label="Proteinas"
                valor={plato.proteinas}
                unidad="g"
                color="#48bb78"
              />
              <Nutriente
                label="Carbohidratos"
                valor={plato.carbohidratos}
                unidad="g"
                color="#4299e1"
              />
              <Nutriente
                label="Grasas"
                valor={plato.grasas}
                unidad="g"
                color="#ed8936"
              />
              <Nutriente
                label="Fibra"
                valor={plato.fibra}
                unidad="g"
                color="#9f7aea"
              />
            </div>
          </div>

          {plato.alergenos?.length > 0 && (
            <div style={estilos.seccion}>
              <h3 style={estilos.tituloSeccion}>Contiene alergenos</h3>
              <div style={estilos.listaChips}>
                {plato.alergenos.map((a) => (
                  <span key={a} style={estilos.alergeno}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={estilos.seccion}>
            <h3 style={estilos.tituloSeccion}>Apto para</h3>
            <div style={estilos.listaChips}>
              {plato.apto_vegetariano && (
                <span style={estilos.apto}>Vegetariano</span>
              )}
              {plato.apto_vegano && <span style={estilos.apto}>Vegano</span>}
              {plato.apto_sin_gluten && (
                <span style={estilos.apto}>Sin gluten</span>
              )}
              {plato.apto_diabetes && (
                <span style={estilos.apto}>Diabetes</span>
              )}
              {plato.apto_hipertension && (
                <span style={estilos.apto}>Hipertension</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Nutriente({ label, valor, unidad, color }) {
  return (
    <div style={estilos.nutriente}>
      <p style={{ fontSize: "1.4rem", fontWeight: "700", color, margin: 0 }}>
        {valor}
        <span style={{ fontSize: "0.75rem", color: "#999" }}>{unidad}</span>
      </p>
      <p style={{ fontSize: "0.75rem", color: "#888", margin: "4px 0 0" }}>
        {label}
      </p>
    </div>
  );
}

function nombreFuente(tipo) {
  const fuentes = {
    alergeno: "Menu",
    fooddata: "FoodData",
    compatibilidad_ia: "IA",
    diabetes: "Reglas",
    hipertension: "Reglas",
  };
  return fuentes[tipo] || "Alerta";
}

const estilos = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    maxWidth: "480px",
    width: "calc(100% - 2rem)",
    maxHeight: "90vh",
    height: "80vh",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  contenidoScrolleable: {
    flex: 1,
    overflow: "auto",
    padding: "2rem",
    paddingTop: "3rem",
    boxSizing: "border-box",
  },
  cerrar: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#888",
  },
  analizando: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "500",
    marginBottom: "1rem",
    lineHeight: "1.4",
  },
  alerta: {
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "500",
    marginBottom: "1rem",
    lineHeight: "1.4",
  },
  alertaItem: {
    display: "grid",
    gridTemplateColumns: "84px 1fr",
    gap: "8px",
    alignItems: "start",
    marginBottom: "6px",
  },
  alertaFuente: {
    fontSize: "0.72rem",
    textTransform: "uppercase",
  },
  alertaPeligro: {
    backgroundColor: "#fff5f5",
    border: "1px solid #fed7d7",
    color: "#e53e3e",
  },
  alertaPrecaucion: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fbd38d",
    color: "#c05621",
  },
  nombre: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "8px",
  },
  descripcion: {
    fontSize: "0.9rem",
    color: "#666",
    lineHeight: "1.5",
    marginBottom: "4px",
  },
  precio: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#c8a96e",
    marginBottom: "1rem",
  },
  seccion: {
    borderTop: "1px solid #f0f0f0",
    paddingTop: "1rem",
    marginTop: "1rem",
  },
  tituloSeccion: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#444",
    marginBottom: "12px",
  },
  gridNutri: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
  },
  nutriente: {
    textAlign: "center",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },
  listaChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  alergeno: {
    padding: "4px 12px",
    borderRadius: "20px",
    backgroundColor: "#fff5f5",
    color: "#e53e3e",
    fontSize: "0.8rem",
    fontWeight: "500",
    border: "1px solid #fed7d7",
  },
  apto: {
    padding: "4px 12px",
    borderRadius: "20px",
    backgroundColor: "#f0fff4",
    color: "#38a169",
    fontSize: "0.8rem",
    fontWeight: "500",
    border: "1px solid #c6f6d5",
  },
};
