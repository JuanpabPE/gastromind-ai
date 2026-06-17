import { useState, useEffect } from "react";
import { supabase } from "../compartido/api/cliente";

const SEDES = [
  "Surco - Av. Primavera",
  "San Isidro - El Olivar",
  "Miraflores - Larco",
  "La Molina",
  "San Borja",
  "Aeropuerto",
];

export default function FichaNutricional({ plato, onCerrar }) {
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    async function verificar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("alergias, enfermedades")
        .eq("usuario_id", user.id)
        .single();

      if (!perfil) return;

      const alergenos = plato.alergenos || [];
      const alergias = (perfil.alergias || []).map((a) => a.toLowerCase());
      const encontrados = alergenos.filter((a) =>
        alergias.includes(a.toLowerCase()),
      );

      if (encontrados.length > 0) {
        setAlerta({
          tipo: "peligro",
          mensaje: `Este plato contiene ${encontrados.join(", ")} — ingredientes que debes evitar según tu perfil.`,
        });
        return;
      }

      if (
        perfil.enfermedades?.includes("Diabetes") &&
        plato.carbohidratos > 60
      ) {
        setAlerta({
          tipo: "precaucion",
          mensaje: `Este plato tiene ${plato.carbohidratos}g de carbohidratos. Consúmelo con moderación si tienes diabetes.`,
        });
        return;
      }

      if (perfil.enfermedades?.includes("Hipertensión") && plato.grasas > 25) {
        setAlerta({
          tipo: "precaucion",
          mensaje: `Este plato puede ser alto en sodio. Consúmelo con moderación si tienes hipertensión.`,
        });
      }
    }
    verificar();
  }, [plato]);
  return (
    <div style={estilos.overlay} onClick={onCerrar}>
      <div style={estilos.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onCerrar} style={estilos.cerrar}>
          ✕
        </button>

        {/* Contenido scrolleable */}
        <div style={estilos.contenidoScrolleable}>
          {alerta && (
            <div
              style={{
                backgroundColor:
                  alerta.tipo === "peligro" ? "#fff5f5" : "#fffbeb",
                border: `1px solid ${alerta.tipo === "peligro" ? "#fed7d7" : "#fbd38d"}`,
                color: alerta.tipo === "peligro" ? "#e53e3e" : "#c05621",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "500",
                marginBottom: "1rem",
                lineHeight: "1.4",
              }}
            >
              {alerta.mensaje}
            </div>
          )}

          <h2 style={estilos.nombre}>{plato.nombre}</h2>
          <p style={estilos.descripcion}>{plato.descripcion}</p>
          <p style={estilos.precio}>S/. {plato.precio}</p>

          <div style={estilos.seccion}>
            <h3 style={estilos.tituloSeccion}>Información nutricional</h3>
            <div style={estilos.gridNutri}>
              <Nutriente
                label="Calorías"
                valor={plato.calorias}
                unidad="kcal"
                color="#c8a96e"
              />
              <Nutriente
                label="Proteínas"
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
              <h3 style={estilos.tituloSeccion}>Contiene alérgenos</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
                <span style={estilos.apto}>Hipertensión</span>
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
    <div
      style={{
        textAlign: "center",
        padding: "12px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
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
    width: "100%",
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
  botonesContenedor: {
    padding: "1rem 2rem",
    borderTop: "1px solid #f0f0f0",
    boxSizing: "border-box",
    flexShrink: 0,
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
  btnPedir: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#c8a96e",
    color: "#fff",
    fontWeight: "600",
    fontSize: "0.95rem",
    border: "none",
    cursor: "pointer",
    marginTop: "1rem",
  },
};
