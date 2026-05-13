import { useState } from "react";
import { useAuth } from "./useAuth";
import { useNavigate, Link } from "react-router-dom";
import logoTanta from "../assets/images/logo_tanta.png";

// Criterios de validación de contraseña
const CRITERIOS_CONTRASEÑA = {
  minimo: { test: (p) => p.length >= 6, label: "Mínimo 6 caracteres" },
  mayuscula: {
    test: (p) => /[A-Z]/.test(p),
    label: "Al menos 1 mayúscula (A-Z)",
  },
  minuscula: {
    test: (p) => /[a-z]/.test(p),
    label: "Al menos 1 minúscula (a-z)",
  },
  numero: { test: (p) => /[0-9]/.test(p), label: "Al menos 1 número (0-9)" },
  especial: {
    test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
    label: "Al menos 1 carácter especial (!@#$%^&*)",
  },
};

// Generar contraseña aleatoria muy segura
function generarContraseñaAleatoria() {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}';:\"\\|,.<>/?";
  let contraseña = "";
  for (let i = 0; i < 12; i++) {
    contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return contraseña;
}

function evaluarFortalezaContraseña(password) {
  const cumplidos = Object.values(CRITERIOS_CONTRASEÑA).filter((c) =>
    c.test(password),
  ).length;
  const totalCriterios = Object.keys(CRITERIOS_CONTRASEÑA).length;

  // NO SEGURA: falta al menos un criterio
  if (cumplidos < totalCriterios) {
    return { nivel: "no segura", porcentaje: 33, color: "#E91E63" };
  }

  // MUY SEGURA: todos los criterios + 10+ caracteres (silencioso, no mostrar en UI)
  if (password.length >= 10) {
    return { nivel: "muy segura", porcentaje: 100, color: "#4CAF50" };
  }

  // SEGURA: todos los criterios (6-9 caracteres)
  return { nivel: "segura", porcentaje: 66, color: "#FF8C00" };
}

export default function PaginaRegister() {
  const { register, cargando, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [mostrarTooltipSugerencia, setMostrarTooltipSugerencia] = useState(false);

  const fortaleza = evaluarFortalezaContraseña(form.password);
  const contraseñasCoinciden = form.password === form.confirmPassword && form.password !== "";
  const puedeEnviar =
    form.nombre && form.email && fortaleza.nivel !== "no segura" && contraseñasCoinciden;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function mostrarSugerencia() {
    const sugerida = generarContraseñaAleatoria();
    setForm({ ...form, password: sugerida, confirmPassword: sugerida });
    setMostrarTooltipSugerencia(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!contraseñasCoinciden) {
      alert("Las contraseñas no coinciden");
      return;
    }
    // Guardar nombre en sessionStorage para /completar
    sessionStorage.setItem("nombreRegistro", form.nombre);
    const resultado = await register(form);
    if (resultado) navigate("/perfil/completar");
  }

  return (
    <div style={estilos.pagina}>
      {/* Logo TANTA afuera del formulario, esquina superior izquierda */}
      <img src={logoTanta} alt="TANTA Logo" style={estilos.logoExterno} />

      <div style={estilos.tarjeta}>
        <h1 style={estilos.titulo}>Crea tu cuenta</h1>
        <p style={estilos.subtitulo}>en <span style={estilos.spanTanta}>TANTA Restaurante</span></p>

        <form onSubmit={handleSubmit} style={estilos.form}>
          <div style={estilos.contenedor}>
            <label style={estilos.labelTexto}>Nombre completo</label>
            <input
              name="nombre"
              type="text"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              style={estilos.input}
              required
            />
          </div>

          <div style={estilos.contenedor}>
            <label style={estilos.labelTexto}>Correo electrónico</label>
            <input
              name="email"
              type="email"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={handleChange}
              style={estilos.input}
              required
            />
          </div>

          {/* Contraseña con validación fuerte y tooltip de sugerencia */}
          <div style={estilos.contenedor}>
            <div
              style={estilos.labelConTooltip}
              onMouseEnter={() => {
                if (!mostrarTooltipSugerencia) {
                  mostrarSugerencia();
                  setMostrarTooltipSugerencia(true);
                }
              }}
              onMouseLeave={() => setMostrarTooltipSugerencia(false)}
            >
              <label style={estilos.labelTexto}>Contraseña</label>
              <div style={estilos.contenedorTooltip}>
                <button
                  type="button"
                  style={estilos.botonTooltip}
                  title="Ver sugerencia de contraseña"
                >
                  💡
                </button>
                {mostrarTooltipSugerencia && (
                  <div style={estilos.tooltip}>
                    <div style={estilos.tooltipContenido}>
                      <p style={estilos.tooltipTexto}>{form.password}</p>
                      <button
                        type="button"
                        onClick={() => setMostrarTooltipSugerencia(false)}
                        style={estilos.botonAplicar}
                      >
                        ✓ Usar esta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={estilos.contenedorContrasena}>
              <input
                name="password"
                type={mostrarPassword ? "text" : "password"}
                placeholder="Tu contraseña segura"
                value={form.password}
                onChange={handleChange}
                style={estilos.inputContrasena}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={estilos.botonOjo}
                title={mostrarPassword ? "Ocultar" : "Mostrar"}
              >
                {mostrarPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {/* Barra de fortaleza */}
            {form.password && (
              <div style={estilos.barraContenedor}>
                <div
                  style={{
                    ...estilos.barraFondo,
                    backgroundColor: fortaleza.color,
                    width: `${fortaleza.porcentaje}%`,
                  }}
                />
              </div>
            )}

            {/* Etiqueta de fortaleza */}
            {form.password && (
              <p style={{ ...estilos.nivelFortaleza, color: fortaleza.color }}>
                Fortaleza: <strong>{fortaleza.nivel.toUpperCase()}</strong>
              </p>
            )}

            {/* Lista de criterios */}
            {form.password && (
              <div style={estilos.criterios}>
                {Object.entries(CRITERIOS_CONTRASEÑA).map(([key, criterio]) => {
                  const cumple = criterio.test(form.password);
                  return (
                    <div key={key} style={estilos.criterio}>
                      <span style={{ color: cumple ? "#4CAF50" : "#ccc" }}>
                        {cumple ? "✓" : "○"}
                      </span>
                      <span style={{ color: cumple ? "#333" : "#bbb" }}>
                        {criterio.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Repetir Contraseña */}
          <div style={estilos.contenedor}>
            <label style={estilos.labelTexto}>Repetir contraseña</label>
            <div style={estilos.contenedorContrasena}>
              <input
                name="confirmPassword"
                type={mostrarConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
                style={{
                  ...estilos.inputContrasena,
                  borderColor:
                    form.confirmPassword && !contraseñasCoinciden
                      ? "#E91E63"
                      : "inherit",
                }}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                style={estilos.botonOjo}
                title={mostrarConfirmPassword ? "Ocultar" : "Mostrar"}
              >
                {mostrarConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {form.confirmPassword && !contraseñasCoinciden && (
              <p style={estilos.errorValidacion}>Las contraseñas no coinciden</p>
            )}
            {contraseñasCoinciden && (
              <p style={estilos.exitoValidacion}>✓ Contraseñas coinciden</p>
            )}
          </div>

          {error && <p style={estilos.error}>{error}</p>}
          <button
            type="submit"
            style={{
              ...estilos.boton,
              opacity: puedeEnviar ? 1 : 0.5,
              cursor: puedeEnviar ? "pointer" : "not-allowed",
            }}
            disabled={!puedeEnviar || cargando}
          >
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p style={estilos.link}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={estilos.linkTexto}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #F5F0E8 0%, #EAE1D5 100%)",
    fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
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
    backgroundColor: "#ffffff",
    padding: "3rem 2.5rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
    position: "relative",
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
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  contenedor: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #E5E5E5",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "'Montserrat', sans-serif",
    transition: "all 0.25s ease",
    backgroundColor: "#FFFFFF",
  },
  labelTexto: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#333",
    display: "block",
    marginBottom: "2px",
  },
  labelConTooltip: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contenedorTooltip: {
    position: "relative",
  },
  botonTooltip: {
    background: "none",
    border: "none",
    fontSize: "1.1rem",
    cursor: "pointer",
    padding: "2px 6px",
    opacity: 0.6,
    transition: "opacity 0.2s",
  },
  tooltip: {
    position: "absolute",
    top: "-120px",
    right: "-30px",
    zIndex: 100,
    backgroundColor: "#8B2E3B",
    color: "#fff",
    padding: "0",
    borderRadius: "10px",
    minWidth: "280px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontSize: "0.85rem",
  },
  tooltipContenido: {
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  tooltipTexto: {
    margin: "0",
    fontSize: "0.95rem",
    fontWeight: "700",
    fontFamily: "monospace",
    wordBreak: "break-all",
  },
  botonAplicar: {
    backgroundColor: "#E91E63",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  contenedorContrasena: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputContrasena: {
    padding: "12px 45px 12px 14px",
    borderRadius: "8px",
    border: "1px solid #E5E5E5",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "'Montserrat', sans-serif",
    transition: "all 0.25s ease",
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  botonOjo: {
    position: "absolute",
    right: "12px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "1.1rem",
    opacity: 0.6,
    transition: "opacity 0.2s",
    padding: "4px",
  },
  barraContenedor: {
    width: "100%",
    height: "6px",
    backgroundColor: "#E8E8E8",
    borderRadius: "3px",
    overflow: "hidden",
  },
  barraFondo: {
    height: "100%",
    transition: "all 0.3s ease",
    borderRadius: "3px",
  },
  nivelFortaleza: {
    fontSize: "0.8rem",
    margin: "4px 0 0",
    fontWeight: "600",
    color: "#E91E63",
  },
  criterios: {
    fontSize: "0.75rem",
    backgroundColor: "#FFF3E0",
    padding: "10px 12px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    border: "1px solid #FFE0B2",
  },
  criterio: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  errorValidacion: {
    fontSize: "0.8rem",
    color: "#E91E63",
    margin: "4px 0 0",
    fontWeight: "500",
  },
  exitoValidacion: {
    fontSize: "0.8rem",
    color: "#4CAF50",
    margin: "4px 0 0",
    fontWeight: "500",
  },
  boton: {
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "#E91E63",
    color: "#fff",
    fontWeight: "700",
    fontSize: "0.95rem",
    border: "none",
    cursor: "pointer",
    marginTop: "20px",
    transition: "all 0.25s ease",
    fontFamily: "'Montserrat', sans-serif",
    boxShadow: "0 2px 6px rgba(233, 30, 99, 0.2)",
  },
  error: {
    color: "#E91E63",
    fontSize: "0.85rem",
    padding: "10px",
    backgroundColor: "#FFE6F0",
    borderRadius: "6px",
    fontWeight: "500",
    margin: "0",
    textAlign: "center",
  },
  link: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.9rem",
    color: "#666",
    fontFamily: "'Montserrat', sans-serif",
  },
  linkTexto: { 
    color: "#E91E63", 
    fontWeight: "700", 
    textDecoration: "none",
    transition: "opacity 0.2s",
  },
};
