import { useState } from "react";
import { useAuth } from "./useAuth";
import { useNavigate, Link } from "react-router-dom";

export default function PaginaLogin() {
  const { login, cargando, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

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
        <h1 style={estilos.titulo}>GastroMind AI</h1>
        <p style={estilos.subtitulo}>Bienvenido a Tanta</p>

        <form onSubmit={handleSubmit} style={estilos.form}>
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            style={estilos.input}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            style={estilos.input}
            required
          />
          {error && <p style={estilos.error}>{error}</p>}
          <button type="submit" style={estilos.boton} disabled={cargando}>
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
