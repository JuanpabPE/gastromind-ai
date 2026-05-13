import { useState } from "react";
import { useAuth } from "./useAuth";
import { useNavigate, Link } from "react-router-dom";
import logoTanta from "../assets/images/logo_tanta.png";

export default function PaginaLogin() {
  const { login, cargando, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
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
      {/* Logo TANTA afuera del formulario, esquina superior izquierda */}
      <img src={logoTanta} alt="TANTA Logo" style={estilos.logoExterno} />

      <div style={estilos.tarjeta}>
        <h1 style={estilos.titulo}>Bienvenido de nuevo</h1>
        <p style={estilos.subtitulo}>a <span style={estilos.spanTanta}>TANTA Restaurante</span></p>

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
            <div style={estilos.contenedorContraseña}>
              <input
                name="password"
                type={mostrarContraseña ? "text" : "password"}
                placeholder="Tu contraseña"
                value={form.password}
                onChange={handleChange}
                style={estilos.inputContraseña}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarContraseña(!mostrarContraseña)}
                style={estilos.botonOjo}
                title={mostrarContraseña ? "Ocultar" : "Mostrar"}
              >
                {mostrarContraseña ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
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
    background: "linear-gradient(135deg, #F5F0E8 0%, #EAE1D5 100%)",
    fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  logoExterno: {
    position: "fixed",
    top: "2rem",
    left: "2rem",
    width: "70px",
    height: "auto",
    objectFit: "contain",
    zIndex: 10,
  },
  tarjeta: {
    backgroundColor: "#ffffff",
    padding: "3rem 2.5rem",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
    position: "relative",
    backdropFilter: "blur(10px)",
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
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  contenedor: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  labelTexto: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#333",
    display: "block",
    marginBottom: "6px",
  },
  input: {
    padding: "13px 14px",
    borderRadius: "10px",
    border: "2px solid #E8E8E8",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "'Montserrat', sans-serif",
    transition: "all 0.3s ease",
    backgroundColor: "#FAFAFA",
  },
  contenedorContraseña: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputContraseña: {
    padding: "13px 45px 13px 14px",
    borderRadius: "10px",
    border: "2px solid #E8E8E8",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "'Montserrat', sans-serif",
    transition: "all 0.3s ease",
    backgroundColor: "#FAFAFA",
    width: "100%",
  },
  botonOjo: {
    position: "absolute",
    right: "12px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "1.2rem",
    opacity: 0.6,
    transition: "opacity 0.2s",
    padding: "4px",
  },
  boton: {
    padding: "13px 16px",
    borderRadius: "10px",
    backgroundColor: "#E91E63",
    color: "#fff",
    fontWeight: "700",
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    marginTop: "16px",
    transition: "all 0.3s ease",
    fontFamily: "'Montserrat', sans-serif",
    boxShadow: "0 4px 12px rgba(233, 30, 99, 0.3)",
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
