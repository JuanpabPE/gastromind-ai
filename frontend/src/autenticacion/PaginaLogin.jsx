import { useState } from "react";
import { useAuth } from "./useAuth";
import { useNavigate, Link } from "react-router-dom";
import logoTanta from "../assets/images/logo_tanta.png";

export default function PaginaLogin() {
  const { login, cargando, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const puedeEnviar = form.email && form.password;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const resultado = await login(form);
    if (resultado) navigate("/menu");
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.tarjeta}>
        {/* Logo TANTA en esquina superior izquierda */}
        <img src={logoTanta} alt="TANTA Logo" style={estilos.logo} />

        <h1 style={estilos.titulo}>Bienvenido de nuevo</h1>
        <p style={estilos.subtitulo}>a TANTA Restaurante</p>

        <form onSubmit={handleSubmit} style={estilos.form}>
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

          <div style={estilos.contenedor}>
            <label style={estilos.labelTexto}>Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="Tu contraseña"
              value={form.password}
              onChange={handleChange}
              style={estilos.input}
              required
            />
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
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p style={estilos.link}>
          ¿No tienes cuenta?{" "}
          <Link to="/register" style={estilos.linkTexto}>
            Regístrate aquí
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
  contenedor: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  labelTexto: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#333",
    display: "block",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "2px solid #E0E0E0",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "'Montserrat', sans-serif",
    transition: "border-color 0.2s",
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
    padding: "8px",
    backgroundColor: "#FFE6F0",
    borderRadius: "4px",
    fontWeight: "500",
    margin: "0",
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
