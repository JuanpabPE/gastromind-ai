import { useState, useRef, useEffect } from "react";
import BurbujaMensaje from "./BurbujaMensaje";

const SUGERENCIAS = [
  "Que me recomiendas para hoy?",
  "Cual es el plato mas ligero?",
  "Que tiene el lomo saltado?",
  "Hay opciones vegetarianas?",
];

export default function VentanaChat({ onCerrar, chatProps }) {
  const { mensajes, cargando, enviarMensaje, limpiarChat } = chatProps;
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function handleEnviar() {
    if (!input.trim() || cargando) return;
    const texto = input;
    setInput("");
    await enviarMensaje(texto);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  }

  return (
    <div style={estilos.overlay}>
      <div style={estilos.ventana}>
        <div style={estilos.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={estilos.logoHeader}>T</div>
            <div>
              <p style={estilos.headerTitulo}>Nutricionista Tanta</p>
              <p style={estilos.headerSub}>Tu sommelier nutricional</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={limpiarChat}
              style={estilos.btnHeader}
              title="Limpiar chat"
            >
              Limpiar
            </button>
            <button onClick={onCerrar} style={estilos.btnHeader}>
              Cerrar
            </button>
          </div>
        </div>

        <div style={estilos.mensajes}>
          {mensajes.map((m, i) => (
            <BurbujaMensaje key={i} mensaje={m} />
          ))}
          {cargando && (
            <div
              style={{
                padding: "8px 16px",
                color: "#888",
                fontSize: "0.85rem",
                fontStyle: "italic",
              }}
            >
              Escribiendo...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {mensajes.length === 1 && (
          <div style={estilos.sugerencias}>
            <p style={estilos.sugerenciasTitulo}>Preguntas frecuentes</p>
            {SUGERENCIAS.map((s, i) => (
              <button
                key={i}
                onClick={() => enviarMensaje(s)}
                style={estilos.chip}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={estilos.inputArea}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu consulta nutricional..."
            style={estilos.textarea}
            rows={1}
            disabled={cargando}
          />
          <button
            onClick={handleEnviar}
            disabled={cargando || !input.trim()}
            style={{
              ...estilos.btnEnviar,
              opacity: cargando || !input.trim() ? 0.5 : 1,
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

const estilos = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: "1rem",
    zIndex: 2000,
  },
  ventana: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    width: "400px",
    height: "600px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    overflow: "hidden",
    fontFamily: "Georgia, serif",
  },
  header: {
    backgroundColor: "#8B1A1A",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoHeader: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    color: "#8B1A1A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "1.1rem",
    fontFamily: "Georgia, serif",
  },
  headerTitulo: {
    color: "#fff",
    fontWeight: "700",
    fontSize: "0.95rem",
    margin: 0,
  },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: "0.75rem", margin: 0 },
  btnHeader: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontFamily: "Georgia, serif",
  },
  mensajes: { flex: 1, overflowY: "auto", padding: "1rem" },
  sugerencias: { padding: "0 1rem 0.5rem" },
  sugerenciasTitulo: {
    fontSize: "0.75rem",
    color: "#888",
    margin: "0 0 6px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  chip: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#fafafa",
    fontSize: "0.82rem",
    cursor: "pointer",
    color: "#555",
    marginBottom: "4px",
    fontFamily: "Georgia, serif",
  },
  inputArea: {
    padding: "0.75rem",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "0.9rem",
    resize: "none",
    outline: "none",
    fontFamily: "Georgia, serif",
  },
  btnEnviar: {
    padding: "10px 16px",
    borderRadius: "8px",
    backgroundColor: "#8B1A1A",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    fontFamily: "Georgia, serif",
    whiteSpace: "nowrap",
  },
};
