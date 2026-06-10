import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePerfil } from "./usePerfil";
import logoTanta from "../assets/images/logo_tanta.png";

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
  const [validacionErrors, setValidacionErrors] = useState({});
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [cooldownMessage, setCooldownMessage] = useState("");

  useEffect(() => {
    const ts = parseInt(
      localStorage.getItem("registro_cooldown_until") || "0",
      10,
    );
    if (ts && Date.now() < ts) {
      setCooldownUntil(ts);
      const mins = Math.ceil((ts - Date.now()) / 60000);
      setCooldownMessage(
        `Demasiados intentos. Intenta nuevamente en ${mins} minutos.`,
      );
    }
  }, []);

  const [form, setForm] = useState({
    nombre: "",
    fecha_nacimiento: "",
    alergias: [],
    intolerancias: [],
    enfermedades: [],
    preferencias: [],
    objetivo_calorico: 2000,
  });

  // Cargar nombre desde sessionStorage
  useEffect(() => {
    const registroTemp = sessionStorage.getItem("registro_temporal");
    if (registroTemp) {
      const { nombre, email } = JSON.parse(registroTemp);
      setNombreRegistrado(nombre);
      setForm((f) => ({ ...f, nombre }));
    } else {
      const nombre = sessionStorage.getItem("nombreRegistro");
      if (nombre) {
        setNombreRegistrado(nombre);
        setForm((f) => ({ ...f, nombre }));
      }
    }
  }, []);

  // Validación en tiempo real
  const validar = () => {
    const errores = {};

    if (!form.fecha_nacimiento) {
      errores.fecha_nacimiento = "Debes ingresar tu fecha de nacimiento";
    }
    if (form.alergias.length === 0) {
      errores.alergias = "Selecciona al menos una opción de alergias";
    }
    if (form.enfermedades.length === 0) {
      errores.enfermedades =
        "Selecciona al menos una opción de condiciones de salud";
    }
    if (form.preferencias.length === 0) {
      errores.preferencias = "Selecciona al menos una preferencia alimentaria";
    }

    setValidacionErrors(errores);
    return Object.keys(errores).length === 0;
  };

  function handleInput(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setValidacionErrors({ ...validacionErrors, [e.target.name]: null });
  }

  function toggleOpcion(campo, valor) {
    const actual = form[campo];

    if (valor === "Ninguna") {
      setForm({ ...form, [campo]: ["Ninguna"] });
      setValidacionErrors({ ...validacionErrors, [campo]: null });
      return;
    }

    const sinNinguna = actual.filter((v) => v !== "Ninguna");
    const nueva = sinNinguna.includes(valor)
      ? sinNinguna.filter((v) => v !== valor)
      : [...sinNinguna, valor];

    setForm({ ...form, [campo]: nueva });
    setValidacionErrors({ ...validacionErrors, [campo]: null });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (cooldownUntil && Date.now() < cooldownUntil) {
      const mins = Math.ceil((cooldownUntil - Date.now()) / 60000);
      setCooldownMessage(
        `Demasiados intentos. Espera ${mins} minutos antes de reintentar.`,
      );
      return;
    }

    // Validar antes de enviar
    if (!validar()) {
      return;
    }

    const resultado = await guardarPerfil(form);
    if (resultado?.ok) {
      if (resultado.requiereVerificacion) {
        sessionStorage.setItem(
          "avisoVerificacion",
          "Tu cuenta fue creada. Revisa tu correo para verificarla y luego inicia sesión.",
        );
      }
      navigate("/login");
    }
  }

  return (
    <div style={estilos.pagina}>
      {/* Logo TANTA afuera del formulario */}
      <img src={logoTanta} alt="TANTA Logo" style={estilos.logoExterno} />

      <div style={estilos.tarjeta}>
        <h1 style={estilos.titulo}>Completa tu perfil</h1>
        <p style={estilos.subtitulo}>
          en <span style={estilos.spanTanta}>TANTA Restaurante</span>
        </p>

        <form onSubmit={handleSubmit} style={estilos.form}>
          {/* Datos básicos */}
          <div style={estilos.seccion}>
            <h3 style={estilos.tituloSeccion}>Información Personal</h3>

            <div style={estilos.contenedor}>
              <label style={estilos.label}>Nombre</label>
              <input
                name="nombre"
                placeholder="Tu nombre completo"
                value={form.nombre}
                style={estilos.inputDisabled}
                readOnly
              />
              <p style={estilos.ayuda}>
                Este nombre fue registrado durante tu registro
              </p>
            </div>

            <div style={estilos.contenedor}>
              <label style={estilos.label}>Fecha de nacimiento</label>
              <input
                name="fecha_nacimiento"
                type="date"
                value={form.fecha_nacimiento}
                onChange={handleInput}
                style={{
                  ...estilos.input,
                  borderColor: validacionErrors.fecha_nacimiento
                    ? "#e53e3e"
                    : "#e0e0e0",
                }}
              />
              {validacionErrors.fecha_nacimiento && (
                <p style={estilos.errorMensaje}>
                  {validacionErrors.fecha_nacimiento}
                </p>
              )}
            </div>
          </div>

          {/* Alergias */}
          <div style={estilos.seccion}>
            <h3 style={estilos.tituloSeccion}>Alergias</h3>
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
            {validacionErrors.alergias && (
              <p style={estilos.errorMensaje}>{validacionErrors.alergias}</p>
            )}
          </div>

          {/* Condiciones de salud */}
          <div style={estilos.seccion}>
            <h3 style={estilos.tituloSeccion}>Condiciones de Salud</h3>
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
            {validacionErrors.enfermedades && (
              <p style={estilos.errorMensaje}>
                {validacionErrors.enfermedades}
              </p>
            )}
          </div>

          {/* Preferencias */}
          <div style={estilos.seccion}>
            <h3 style={estilos.tituloSeccion}>Preferencias Alimentarias</h3>
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
            {validacionErrors.preferencias && (
              <p style={estilos.errorMensaje}>
                {validacionErrors.preferencias}
              </p>
            )}
          </div>

          {/* Objetivo calórico */}
          <div style={estilos.seccion}>
            <h3 style={estilos.tituloSeccion}>Objetivo Calórico Diario</h3>
            <div style={estilos.rango}>
              <input
                type="range"
                name="objetivo_calorico"
                min="1200"
                max="3500"
                step="100"
                value={form.objetivo_calorico}
                onChange={handleInput}
                style={estilos.inputRange}
              />
              <span style={estilos.calorias}>
                {form.objetivo_calorico} kcal
              </span>
            </div>
          </div>

          {(cooldownMessage || error) && (
            <p style={estilos.errorGlobal}>{cooldownMessage || error}</p>
          )}

          <button
            type="submit"
            style={{
              ...estilos.boton,
              opacity: cargando ? 0.7 : 1,
              cursor: cargando ? "not-allowed" : "pointer",
            }}
            disabled={cargando || (cooldownUntil && Date.now() < cooldownUntil)}
          >
            {cargando ? "Guardando..." : "Guardar Perfil y Continuar"}
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
        padding: "8px 16px",
        borderRadius: "20px",
        border: `2px solid ${activo ? color : "#e0e0e0"}`,
        backgroundColor: activo ? color : "#fff",
        color: activo ? "#fff" : "#666",
        fontSize: "0.9rem",
        fontWeight: activo ? "600" : "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {label}
    </button>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #F5F0E8 0%, #EAE1D5 100%)",
    fontFamily:
      "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "2rem 1rem",
  },
  logoExterno: {
    position: "fixed",
    top: "2rem",
    left: "2rem",
    width: "100px",
    height: "auto",
    objectFit: "contain",
    zIndex: 10,
  },
  tarjeta: {
    backgroundColor: "#FAFBFC",
    padding: "3.5rem 2.5rem",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "600px",
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.08)",
  },
  titulo: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#8B2E3B",
    margin: "0 0 8px",
    textAlign: "center",
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: "-0.5px",
  },
  subtitulo: {
    fontSize: "1.05rem",
    color: "#666",
    textAlign: "center",
    marginBottom: "2.5rem",
    fontWeight: "500",
  },
  spanTanta: {
    color: "#E91E63",
    fontWeight: "700",
    fontSize: "1.15rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  seccion: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  tituloSeccion: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#8B2E3B",
    margin: "0",
    fontFamily: "'Montserrat', sans-serif",
  },
  contenedor: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#333",
    fontFamily: "'Montserrat', sans-serif",
  },
  input: {
    padding: "13px 14px",
    borderRadius: "10px",
    border: "1.5px solid #E0E0E0",
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Montserrat', sans-serif",
    transition: "border-color 0.2s ease",
  },
  inputDisabled: {
    padding: "13px 14px",
    borderRadius: "10px",
    border: "1.5px solid #E0E0E0",
    fontSize: "0.95rem",
    backgroundColor: "#f9f9f9",
    color: "#666",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Montserrat', sans-serif",
    cursor: "not-allowed",
  },
  ayuda: {
    fontSize: "0.85rem",
    color: "#888",
    margin: "0 0 8px 0",
    fontStyle: "normal",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  rango: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  inputRange: {
    flex: 1,
    height: "6px",
    borderRadius: "3px",
    background: "linear-gradient(to right, #E91E63, #8B2E3B)",
    outline: "none",
    WebkitAppearance: "none",
  },
  calorias: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#E91E63",
    minWidth: "100px",
    textAlign: "right",
  },
  boton: {
    padding: "13px 16px",
    borderRadius: "10px",
    backgroundColor: "#E91E63",
    color: "#fff",
    fontWeight: "600",
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Montserrat', sans-serif",
    marginTop: "16px",
  },
  errorMensaje: {
    color: "#e53e3e",
    fontSize: "0.85rem",
    margin: "4px 0 0 0",
    fontWeight: "500",
  },
  errorGlobal: {
    color: "#e53e3e",
    fontSize: "0.9rem",
    padding: "12px 14px",
    backgroundColor: "#ffe6e6",
    borderRadius: "8px",
    border: "1px solid #ffcccc",
    margin: "8px 0 0 0",
    fontWeight: "500",
  },
};
