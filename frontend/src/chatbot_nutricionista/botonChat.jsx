import { useState, useRef } from "react";
import VentanaChat from "./VentanaChat";
import { useChat } from "./useChat";

export default function BotonChat() {
  const [abierto, setAbierto] = useState(false);
  const chatProps = useChat(); // ← el hook vive aquí, no en VentanaChat
  const [pos, setPos] = useState({ x: null, y: null });
  const arrastrando = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const botonRef = useRef(null);
  const movio = useRef(false);

  function onMouseDown(e) {
    arrastrando.current = true;
    movio.current = false;
    const rect = botonRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!arrastrando.current) return;
    movio.current = true;
    const x = e.clientX - offset.current.x;
    const y = e.clientY - offset.current.y;
    setPos({
      x: Math.max(0, Math.min(x, window.innerWidth - 160)),
      y: Math.max(0, Math.min(y, window.innerHeight - 60)),
    });
  }

  function onMouseUp() {
    arrastrando.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  function handleClick() {
    if (!movio.current) setAbierto(true);
  }

  return (
    <>
      <button
        ref={botonRef}
        onMouseDown={onMouseDown}
        onClick={handleClick}
        style={{
          position: "fixed",
          bottom: pos.y !== null ? "auto" : "2rem",
          right: pos.x !== null ? "auto" : "2rem",
          top: pos.y !== null ? pos.y + "px" : "auto",
          left: pos.x !== null ? pos.x + "px" : "auto",
          backgroundColor: "#E91E63",
          color: "#fff",
          border: "none",
          borderRadius: "50px",
          padding: "12px 20px",
          fontSize: "0.9rem",
          cursor: "grab",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 16px rgba(233,30,99,0.4)",
          fontWeight: "600",
          userSelect: "none",
          fontFamily: "Georgia, serif",
        }}
        title="Arrastra para mover · Clic para abrir"
      >
        Chatbot Nutricionista
      </button>

      {abierto && (
        <VentanaChat onCerrar={() => setAbierto(false)} chatProps={chatProps} />
      )}
    </>
  );
}
