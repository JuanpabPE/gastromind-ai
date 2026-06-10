import { useState, useRef } from "react";
import VentanaChat from "./VentanaChat";

export default function BotonChat() {
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null });
  const [arrastrandoVisual, setArrastrandoVisual] = useState(false);
  const arrastrando = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const botonRef = useRef(null);
  const movio = useRef(false);

  function onMouseDown(e) {
    arrastrando.current = true;
    setArrastrandoVisual(true);
    movio.current = false;
    const rect = botonRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!arrastrando.current) return;
    movio.current = true;
    const x = e.clientX - offset.current.x;
    const y = e.clientY - offset.current.y;
    // Limita dentro de la pantalla
    const maxX = window.innerWidth - 160;
    const maxY = window.innerHeight - 60;
    setPos({
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    });
  }

  function onMouseUp() {
    arrastrando.current = false;
    setArrastrandoVisual(false);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  function handleClick() {
    // Solo abre si no fue un arrastre
    if (!movio.current) setAbierto(true);
  }

  const estiloBoton = {
    position: "fixed",
    bottom: pos.y !== null ? "auto" : "2rem",
    right: pos.x !== null ? "auto" : "2rem",
    top: pos.y !== null ? pos.y + "px" : "auto",
    left: pos.x !== null ? pos.x + "px" : "auto",
    backgroundColor: "#c8a96e",
    color: "#fff",
    border: "none",
    borderRadius: "50px",
    padding: "12px 20px",
    fontSize: "1rem",
    cursor: arrastrandoVisual ? "grabbing" : "grab",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 16px rgba(200,169,110,0.4)",
    fontWeight: "600",
    userSelect: "none",
  };

  return (
    <>
      <button
        ref={botonRef}
        onMouseDown={onMouseDown}
        onClick={handleClick}
        style={estiloBoton}
        title="Arrastra para mover · Clic para abrir"
      >
        🍽️
        <span style={{ fontSize: "0.85rem" }}>Nutricionista</span>
      </button>

      {abierto && <VentanaChat onCerrar={() => setAbierto(false)} />}
    </>
  );
}
