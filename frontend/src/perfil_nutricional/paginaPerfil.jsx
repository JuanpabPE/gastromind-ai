import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePerfil } from "./usePerfil";

const ALERGIAS_OPCIONES = [
  "Ninguna",
  "Gluten",
  "Lactosa",
  "Huevo",
  "Mariscos",
  "Frutos secos",
  "Soja",
  "Pescado",
];
const ENFERMEDADES_OPCIONES = [
  "Ninguna",
  "Diabetes",
  "Hipertensión",
  "Celiaquía",
  "Colesterol alto",
  "Anemia",
];
const PREFERENCIAS_OPCIONES = [
  "Ninguna",
  "Vegano",
  "Vegetariano",
  "Sin gluten",
  "Kosher",
  "Halal",
  "Sin azúcar",
];

export default function PaginaPerfil() {
  const { guardarPerfil, cargando, error } = usePerfil();
  const navigate = useNavigate();
  const [nombreRegistrado, setNombreRegistrado] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    fecha_nacimiento: "",
    alergias: [],
    intolerancias: [],
    enfermedades: [],
    preferencias: [],
    objetivo_calorico: 2000,
  });

  // Cargar nombre desde sessionStorage al montar el componente
  useEffect(() => {
    const nombre = sessionStorage.getItem("nombreRegistro");
    if (nombre) {
      setNombreRegistrado(nombre);
      setForm((f) => ({ ...f, nombre }));
    }
  }, []);

  // Validar que el perfil esté completo
  const perfilIncompleto =
    !form.nombre ||
    form.alergias.length === 0 ||
    form.enfermedades.length === 0 ||
    form.preferencias.length === 0;

  const mensajeValidacion = perfilIncompleto
    ? "Por favor completa todos los campos: Alergias, Condiciones de salud y Preferencias alimentarias"
    : null;

  function handleInput(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleOpcion(campo, valor) {
    const actual = form[campo];

    if (valor === "Ninguna") {
      setForm({ ...form, [campo]: ["Ninguna"] });
      return;
    }

    const sinNinguna = actual.filter((v) => v !== "Ninguna");
    const nueva = sinNinguna.includes(valor)
      ? sinNinguna.filter((v) => v !== valor)
      : [...sinNinguna, valor];

    setForm({ ...form, [campo]: nueva });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validar que el perfil esté completo
    if (perfilIncompleto) {
      alert(
        "Por favor completa todos los campos obligatorios:\n- Alergias\n- Condiciones de salud\n- Preferencias alimentarias"
      );
      return;
    }

    const ok = await guardarPerfil(form);
    if (ok) navigate("/menu");
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.tarjeta}>
        <h1 style={estilos.titulo}>Tu perfil nutricional</h1>
        <p style={estilos.subtitulo}>
          Esta información permite a GastroMind recomendarte platos
          personalizados y alertarte sobre alérgenos.
        </p>

        <form onSubmit={handleSubmit} style={estilos.form}>
          {/* Datos básicos */}
          <Seccion titulo="Datos básicos">
            {nombreRegistrado && (
              <p style={estilos.indicadorRegistrado}>
                Registrado como: <strong>{nombreRegistrado}</strong>
              </p>
            )}
            <input
              name="nombre"
              placeholder="Tu nombre completo"
              value={form.nombre}
              onChange={handleInput}
              style={estilos.inputBloqueado}
              readOnly
              title="Este nombre fue registrado durante tu registro y no puede modificarse aquí"
            />
            <p style={estilos.ayudaNombre}>
              Este nombre no puede modificarse aquí. Si necesitas cambiarlo,
              deberás crear una nueva cuenta.
            </p>
            <label style={estilos.label}>Fecha de nacimiento</label>
            <input
              name="fecha_nacimiento"
              type="date"
              value={form.fecha_nacimiento}
              onChange={handleInput}
              style={estilos.input}
            />
          </Seccion>

          {/* Alergias */}
          <Seccion titulo="⚠️ Alergias">
            <p style={estilos.ayuda}>
              La IA te alertará si un plato contiene estos ingredientes, incluso
              en trazas.
            </p>
            <div style={estilos.chips}>
              {ALERGIAS_OPCIONES.map((op) => (
                <Chip
                  key={op}
                  label={op}
                  activo={form.alergias.includes(op)}
                  onClick={() => toggleOpcion("alergias", op)}
                  color="#e53e3e"
                />
              ))}
            </div>
          </Seccion>

          {/* Enfermedades */}
          <Seccion titulo="🏥 Condiciones de salud">
            <p style={estilos.ayuda}>
              El motor de recomendaciones filtrará platos según tu condición.
            </p>
            <div style={estilos.chips}>
              {ENFERMEDADES_OPCIONES.map((op) => (
                <Chip
                  key={op}
                  label={op}
                  activo={form.enfermedades.includes(op)}
                  onClick={() => toggleOpcion("enfermedades", op)}
                  color="#805ad5"
                />
              ))}
            </div>
          </Seccion>

          {/* Preferencias */}
          <Seccion titulo="🥗 Preferencias alimentarias">
            <div style={estilos.chips}>
              {PREFERENCIAS_OPCIONES.map((op) => (
                <Chip
                  key={op}
                  label={op}
                  activo={form.preferencias.includes(op)}
                  onClick={() => toggleOpcion("preferencias", op)}
                  color="#38a169"
                />
              ))}
            </div>
          </Seccion>

          {/* Objetivo calórico */}
          <Seccion titulo="🎯 Objetivo calórico diario">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <input
                type="range"
                name="objetivo_calorico"
                min="1200"
                max="3500"
                step="100"
                value={form.objetivo_calorico}
                onChange={handleInput}
                style={{ flex: 1 }}
              />
              <span style={estilos.calorias}>
                {form.objetivo_calorico} kcal
              </span>
            </div>
          </Seccion>

          {error && <p style={estilos.error}>{error}</p>}
          {mensajeValidacion && (
            <p style={estilos.validacion}>{mensajeValidacion}</p>
          )}

          <button
            type="submit"
            style={{
              ...estilos.boton,
              opacity: perfilIncompleto ? 0.6 : 1,
              cursor: perfilIncompleto ? "not-allowed" : "pointer",
            }}
            disabled={perfilIncompleto || cargando}
          >
            {cargando ? "Guardando..." : "Guardar perfil y continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: "600",
          color: "#1a1a1a",
          marginBottom: "10px",
        }}
      >
        {titulo}
      </h3>
      {children}
    </div>
  );
}

function Chip({ label, activo, onClick, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: "20px",
        border: `2px solid ${activo ? color : "#e0e0e0"}`,
        backgroundColor: activo ? color : "#fff",
        color: activo ? "#fff" : "#555",
        fontSize: "0.85rem",
        fontWeight: activo ? "600" : "400",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    backgroundColor: "#f5f0eb",
    padding: "2rem 1rem",
    display: "flex",
    justifyContent: "center",
  },
  tarjeta: {
    backgroundColor: "#FAFBFC",
    borderRadius: "20px",
    padding: "3.5rem 2.5rem",
    width: "100%",
    maxWidth: "560px",
    height: "fit-content",
  },
  titulo: {
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "8px",
  },
  subtitulo: {
    fontSize: "0.9rem",
    color: "#888",
    marginBottom: "2rem",
    lineHeight: "1.5",
  },
  form: { display: "flex", flexDirection: "column" },
  input: {
    padding: "13px 14px",
    borderRadius: "10px",
    border: "1.5px solid #E0E0E0",
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "8px",
  },
  inputBloqueado: {
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1px solid #d0d0d0",
    backgroundColor: "#f5f5f5",
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "8px",
    color: "#666",
    cursor: "not-allowed",
    fontWeight: "500",
  },
  indicadorRegistrado: {
    fontSize: "0.85rem",
    color: "#228B22",
    fontWeight: "500",
    marginBottom: "8px",
    padding: "6px 8px",
    backgroundColor: "#f0f8f0",
    borderRadius: "4px",
    border: "1px solid #90ee90",
  },
  ayudaNombre: {
    fontSize: "0.75rem",
    color: "#999",
    marginBottom: "12px",
    marginTop: "-4px",
    fontStyle: "italic",
  },
  label: {
    fontSize: "0.85rem",
    color: "#666",
    marginBottom: "4px",
    display: "block",
  },
  ayuda: {
    fontSize: "0.82rem",
    color: "#999",
    marginBottom: "10px",
    marginTop: "-4px",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: "8px" },
  calorias: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#c8a96e",
    minWidth: "80px",
  },
  boton: {
    padding: "13px",
    borderRadius: "8px",
    backgroundColor: "#c8a96e",
    color: "#fff",
    fontWeight: "600",
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    marginTop: "1rem",
    transition: "opacity 0.2s",
  },
  error: {
    color: "#e53e3e",
    fontSize: "0.85rem",
    padding: "8px",
    backgroundColor: "#ffe6e6",
    borderRadius: "4px",
    border: "1px solid #ffcccc",
  },
  validacion: {
    color: "#d97706",
    fontSize: "0.85rem",
    padding: "8px",
    backgroundColor: "#fef3c7",
    borderRadius: "4px",
    border: "1px solid #fcd34d",
    marginTop: "8px",
  },
};
