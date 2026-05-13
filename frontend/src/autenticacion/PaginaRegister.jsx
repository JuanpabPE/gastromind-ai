import { useState } from "react";
import { useAuth } from "./useAuth";
import { useNavigate, Link } from "react-router-dom";

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

function evaluarFortalezaContraseña(password) {
  const cumplidos = Object.values(CRITERIOS_CONTRASEÑA).filter((c) =>
    c.test(password),
  ).length;
  const totalCriterios = Object.keys(CRITERIOS_CONTRASEÑA).length;

  // Lógica más estricta: requiere TODOS los criterios
  if (cumplidos < totalCriterios) {
    // No segura: falta al menos un criterio
    return { nivel: "no segura", porcentaje: 33, color: "#e53e3e" };
  }

  // Muy segura: todos los criterios + 12+ caracteres
  if (password.length >= 12) {
    return { nivel: "muy segura", porcentaje: 100, color: "#228B22" };
  }

  // Segura: todos los criterios pero menos de 12 caracteres
  return { nivel: "segura", porcentaje: 66, color: "#90ee90" };
}

export default function PaginaRegister() {
  const { register, cargando, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const fortaleza = evaluarFortalezaContraseña(form.password);
  const puedeEnviar = form.nombre && form.email && fortaleza.nivel !== "no segura";

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Guardar nombre en sessionStorage para /completar
    sessionStorage.setItem("nombreRegistro", form.nombre);
    const resultado = await register(form);
    if (resultado) navigate("/perfil/completar");
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.tarjeta}>
        <h1 style={estilos.titulo}>GastroMind AI</h1>
        <p style={estilos.subtitulo}>Crea tu cuenta en Tanta</p>

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

          {/* Contraseña con validación fuerte */}
          <div style={estilos.contenedorContraseña}>
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
                      <span style={{ color: cumple ? "#228B22" : "#ccc" }}>
                        {cumple ? "✓" : "○"}
                      </span>
                      <span style={{ color: cumple ? "#333" : "#bbb" }}>
                        {criterio.label}
                      </span>
                    </div>
                  );
                })}
                {/* Requisito adicional para "muy segura" */}
                <div style={estilos.criterio}>
                  <span style={{ color: form.password.length >= 12 ? "#228B22" : "#ccc" }}>
                    {form.password.length >= 12 ? "✓" : "○"}
                  </span>
                  <span style={{ color: form.password.length >= 12 ? "#333" : "#bbb" }}>
                    Mínimo 12 caracteres (para "MUY SEGURA")
                  </span>
                </div>
              </div>
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
    backgroundColor: "#f5f0eb",
  },
  tarjeta: {
    backgroundColor: "#ffffff",
    padding: "2.5rem",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  titulo: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 4px",
    textAlign: "center",
  },
  subtitulo: {
    fontSize: "0.95rem",
    color: "#888",
    textAlign: "center",
    marginBottom: "2rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "0.95rem",
    outline: "none",
  },
  contenedorContraseña: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  barraContenedor: {
    width: "100%",
    height: "6px",
    backgroundColor: "#e0e0e0",
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
    fontWeight: "500",
  },
  criterios: {
    fontSize: "0.75rem",
    backgroundColor: "#f9f9f9",
    padding: "8px 12px",
    borderRadius: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  criterio: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  boton: {
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#c8a96e",
    color: "#fff",
    fontWeight: "600",
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    marginTop: "8px",
    transition: "opacity 0.2s",
  },
  error: { color: "#e53e3e", fontSize: "0.85rem", margin: "0" },
  link: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.9rem",
    color: "#888",
  },
  linkTexto: { color: "#c8a96e", fontWeight: "600", textDecoration: "none" },
};
