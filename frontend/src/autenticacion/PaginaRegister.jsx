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
  const [form, setForm] = useState({ nombre: "", email: "", password: "", confirmPassword: "" });
  const [mostrarSugerencia, setMostrarSugerencia] = useState(false);
  const fortaleza = evaluarFortalezaContraseña(form.password);
  const contraseñasCoinciden = form.password === form.confirmPassword && form.password !== "";
  const puedeEnviar =
    form.nombre && form.email && fortaleza.nivel !== "no segura" && contraseñasCoinciden;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function aplicarSugerencia() {
    const sugerida = generarContraseñaAleatoria();
    setForm({ ...form, password: sugerida, confirmPassword: sugerida });
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
      <div style={estilos.tarjeta}>
        {/* Logo TANTA en esquina superior izquierda */}
        <img src={logoTanta} alt="TANTA Logo" style={estilos.logo} />

        <h1 style={estilos.titulo}>Crea tu cuenta</h1>
        <p style={estilos.subtitulo}>en TANTA Restaurante</p>

        <form onSubmit={handleSubmit} style={estilos.form}>
          <input
            name="nombre"
            type="text"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={handleChange}
            style={estilos.input}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            style={estilos.input}
            required
          />

          {/* Contraseña con validación fuerte y sugerencia */}
          <div style={estilos.contenedorContraseña}>
            <div style={estilos.labelConBotón}>
              <label style={estilos.labelTexto}>Contraseña</label>
              <button
                type="button"
                onMouseEnter={() => setMostrarSugerencia(true)}
                onMouseLeave={() => setMostrarSugerencia(false)}
                onClick={aplicarSugerencia}
                title="Generar contraseña segura"
                style={{
                  ...estilos.botonSugerencia,
                  opacity: mostrarSugerencia ? 1 : 0.4,
                }}
              >
                ⚠️
              </button>
            </div>

            <input
              name="password"
              type="password"
              placeholder="Contraseña segura"
              value={form.password}
              onChange={handleChange}
              style={estilos.input}
              required
            />

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
          <div style={estilos.contenedorContraseña}>
            <label style={estilos.labelTexto}>Repetir contraseña</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirma tu contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              style={{
                ...estilos.input,
                borderColor: form.confirmPassword && !contraseñasCoinciden ? "#E91E63" : "inherit",
              }}
              required
            />
            {form.confirmPassword && !contraseñasCoinciden && (
              <p style={estilos.errorValidación}>Las contraseñas no coinciden</p>
            )}
            {contraseñasCoinciden && (
              <p style={estilos.exitoValidación}>✓ Contraseñas coinciden</p>
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
            Inicia sesión
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
    backgroundColor: "#F5F0E8",
    fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  tarjeta: {
    backgroundColor: "#ffffff",
    padding: "2.5rem",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    position: "relative",
  },
  logo: {
    width: "60px",
    height: "auto",
    marginBottom: "1.5rem",
    objectFit: "contain",
  },
  titulo: {
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "#8B2E3B",
    margin: "0 0 4px",
    textAlign: "left",
    fontFamily: "'Montserrat', sans-serif",
  },
  subtitulo: {
    fontSize: "0.95rem",
    color: "#E91E63",
    textAlign: "left",
    marginBottom: "2rem",
    fontWeight: "600",
  },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "2px solid #E0E0E0",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "'Montserrat', sans-serif",
    transition: "border-color 0.2s",
  },
  labelTexto: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#333",
    display: "block",
    marginBottom: "4px",
  },
  labelConBotón: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  botonSugerencia: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: "0",
    transition: "opacity 0.2s",
  },
  contenedorContraseña: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  barraContenedor: {
    width: "100%",
    height: "6px",
    backgroundColor: "#E0E0E0",
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
    margin: "4px 0",
    fontWeight: "600",
    color: "#E91E63",
  },
  criterios: {
    fontSize: "0.75rem",
    backgroundColor: "#FFF3E0",
    padding: "8px 12px",
    borderRadius: "6px",
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
  errorValidación: {
    fontSize: "0.8rem",
    color: "#E91E63",
    margin: "0",
    fontWeight: "500",
  },
  exitoValidación: {
    fontSize: "0.8rem",
    color: "#4CAF50",
    margin: "0",
    fontWeight: "500",
  },
  boton: {
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "#E91E63",
    color: "#fff",
    fontWeight: "700",
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    marginTop: "12px",
    transition: "all 0.3s",
    fontFamily: "'Montserrat', sans-serif",
  },
  error: { 
    color: "#E91E63", 
    fontSize: "0.85rem", 
    margin: "0",
    padding: "8px",
    backgroundColor: "#FFE6F0",
    borderRadius: "4px",
    fontWeight: "500",
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
