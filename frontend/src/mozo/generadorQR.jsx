import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const SEDES = [
  "Surco - Av. Primavera",
  "San Isidro - El Olivar",
  "Miraflores - Larco",
  "La Molina",
  "San Borja",
  "Aeropuerto",
];

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5174";

export default function GeneradorQR() {
  const [sede, setSede] = useState(SEDES[0]);

  const mesas = Array.from({ length: 20 }, (_, i) => i + 1);

  function imprimirQR(numero) {
    const url = `${BASE_URL}/mesa/${encodeURIComponent(sede)}/${numero}`;
    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html>
        <head><title>QR Mesa ${numero} - ${sede}</title></head>
        <body style="text-align:center; padding:40px; font-family:sans-serif">
          <h2>Tanta — ${sede}</h2>
          <h1 style="font-size:4rem">Mesa ${numero}</h1>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}" />
          <p style="margin-top:16px; color:#888; font-size:0.85rem">Escanea para unirte al pedido y ver tu perfil nutricional</p>
          <p style="color:#ccc; font-size:0.75rem">${url}</p>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  }

  return (
    <div style={estilos.pagina}>
      <h1 style={estilos.titulo}>Generador de QR por mesa</h1>

      <div style={estilos.sedeSelector}>
        <label style={estilos.label}>Sede</label>
        <select
          value={sede}
          onChange={(e) => setSede(e.target.value)}
          style={estilos.select}
        >
          {SEDES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div style={estilos.grid}>
        {mesas.map((numero) => {
          const url = `${BASE_URL}/mesa/${encodeURIComponent(sede)}/${numero}`;
          return (
            <div key={numero} style={estilos.tarjeta}>
              <p style={estilos.mesaLabel}>Mesa {numero}</p>
              <QRCodeSVG value={url} size={100} />
              <button
                onClick={() => imprimirQR(numero)}
                style={estilos.btnImprimir}
              >
                🖨️ Imprimir
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const estilos = {
  pagina: { minHeight: "100vh", backgroundColor: "#f5f0eb", padding: "1.5rem" },
  titulo: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "1.5rem",
  },
  sedeSelector: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.2rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#555",
    display: "block",
    marginBottom: "6px",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "0.95rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "1rem",
  },
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  mesaLabel: {
    fontWeight: "700",
    fontSize: "1rem",
    color: "#1a1a1a",
    margin: "0 0 10px",
  },
  btnImprimir: {
    marginTop: "10px",
    padding: "6px 12px",
    borderRadius: "6px",
    backgroundColor: "#c8a96e",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
};
