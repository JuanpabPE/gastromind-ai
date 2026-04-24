import { useState, useRef, useEffect } from "react";
import { useChat } from "./useChat";
import BurbujaMensaje from "./BurbujaMensaje";

const SUGERENCIAS = [
  "¿Qué platos me recomiendas para hoy?",
  "¿Cuál es el plato más ligero?",
  "¿Qué tiene el lomo saltado?",
  "¿Hay opciones vegetarianas?",
];

export default function VentanaChat({ onCerrar }) {
  const { mensajes, cargando, enviarMensaje, limpiarChat } = useChat();
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
        {/* Header */}
        <div style={estilos.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>🍽️</span>
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
              🗑️
            </button>
            <button onClick={onCerrar} style={estilos.btnHeader}>
              ✕
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div style={estilos.mensajes}>
          {mensajes.map((m, i) => (
            <BurbujaMensaje key={i} mensaje={m} />
          ))}
          {cargando && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                padding: "8px",
              }}
            >
              <div style={estilos.avatarBot}>🍽️</div>
              <div style={estilos.cargando}>
                <span>●</span>
                <span>●</span>
                <span>●</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Sugerencias */}
        {mensajes.length === 1 && (
          <div style={estilos.sugerencias}>
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

        {/* Input */}
        <div style={estilos.inputArea}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregúntame sobre el menú..."
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
            ➤
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
    borderRadius: "16px",
    width: "380px",
    height: "580px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#c8a96e",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
    borderRadius: "8px",
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  mensajes: { flex: 1, overflowY: "auto", padding: "1rem" },
  cargando: {
    display: "flex",
    gap: "4px",
    padding: "10px 14px",
    backgroundColor: "#f5f0eb",
    borderRadius: "18px",
  },
  avatarBot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },
  sugerencias: {
    padding: "0 1rem 0.5rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  chip: {
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#f9f9f9",
    fontSize: "0.78rem",
    cursor: "pointer",
    color: "#555",
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
    borderRadius: "20px",
    border: "1px solid #e0e0e0",
    fontSize: "0.9rem",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
  },
  btnEnviar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#c8a96e",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    flexShrink: 0,
  },
};
