import { useState } from "react";
import { useAuth } from "./useAuth";
import { useNavigate, Link } from "react-router-dom";
import logoTanta from "../assets/images/logo_tanta.png";

export default function PaginaLogin() {
  const { login, cargando, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [avisoVerificacion, setAvisoVerificacion] = useState(() => {
    const aviso = sessionStorage.getItem("avisoVerificacion") || "";
    if (aviso) {
      sessionStorage.removeItem("avisoVerificacion");
    }
    return aviso;
  });
  const puedeEnviar = form.email && form.password;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAvisoVerificacion("");
    const resultado = await login(form);
    if (resultado) {
      const redirect = localStorage.getItem("redirect_after_login");
      if (redirect) {
        localStorage.removeItem("redirect_after_login");
        navigate(redirect);
      } else {
        navigate("/menu");
      }
    }
  }

  return (
    <div style={estilos.pagina}>
      {/* Logo TANTA afuera del formulario, esquina superior izquierda */}
      <img src={logoTanta} alt="TANTA Logo" style={estilos.logoExterno} />

      <div style={estilos.tarjeta}>
        <h1 style={estilos.titulo}>Bienvenido de nuevo</h1>
        <p style={estilos.subtitulo}>
          a <span style={estilos.spanTanta}>TANTA Restaurante</span>
        </p>

        <form onSubmit={handleSubmit} style={estilos.form}>
          {avisoVerificacion && (
            <p style={estilos.avisoVerificacion}>{avisoVerificacion}</p>
          )}

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
    fontFamily:
      "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
    backgroundColor: "#FAFBFC",
    padding: "3.5rem 2.5rem",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "420px",
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
    border: "1.5px solid #E0E0E0",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "'Montserrat', sans-serif",
    transition: "all 0.25s ease",
    backgroundColor: "#FFFFFF",
  },
  contenedorContraseña: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputContraseña: {
    padding: "13px 45px 13px 14px",
    borderRadius: "10px",
    border: "1.5px solid #E0E0E0",
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
    fontSize: "1.2rem",
    opacity: 0.6,
    transition: "opacity 0.2s",
    padding: "4px",
  },
  boton: {
    padding: "13px 18px",
    borderRadius: "10px",
    backgroundColor: "#E91E63",
    color: "#fff",
    fontWeight: "700",
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    marginTop: "24px",
    transition: "all 0.25s ease",
    fontFamily: "'Montserrat', sans-serif",
    boxShadow: "0 4px 12px rgba(233, 30, 99, 0.25)",
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
  avisoVerificacion: {
    color: "#8B2E3B",
    fontSize: "0.88rem",
    padding: "10px 12px",
    backgroundColor: "#FFF3CD",
    borderRadius: "8px",
    border: "1px solid #FFE08A",
    margin: "0",
    fontWeight: "600",
    lineHeight: 1.45,
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
