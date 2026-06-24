import { useState, useEffect } from "react";
import { supabase } from "../compartido/api/cliente";
import { tema } from "../compartido/estilos/tema";

const RECOMPENSAS = [
  {
    puntos: 50,
    titulo: "Cafe gratis",
    descripcion: "Un cafe espresso o americano en tu proxima visita",
  },
  {
    puntos: 100,
    titulo: "Postre de cortesia",
    descripcion: "Elige entre suspiro a la limena, pie de limon o tres leches",
  },
  {
    puntos: 200,
    titulo: "Entrada para dos",
    descripcion: "Una entrada a elegir de nuestra carta para compartir",
  },
  {
    puntos: 350,
    titulo: "Almuerzo ejecutivo",
    descripcion: "Menu completo: entrada, plato de fondo y bebida",
  },
  {
    puntos: 500,
    titulo: "Cena para dos",
    descripcion: "Cena completa para dos personas en cualquier sede de Tanta",
  },
  {
    puntos: 800,
    titulo: "Chef experience",
    descripcion: "Visita a la cocina y menu de degustacion personalizado",
  },
  {
    puntos: 1000,
    titulo: "Socio Tanta Premium",
    descripcion: "10% de descuento permanente en todas tus visitas por 6 meses",
  },
];

export default function TarjetaPuntos() {
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    async function cargar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("perfiles")
        .select("nombre, puntos_fidelidad, codigo_cliente")
        .eq("usuario_id", user.id)
        .single();
      setPerfil(data);
    }
    cargar();
  }, []);

  if (!perfil) return null;

  const puntos = perfil.puntos_fidelidad || 0;
  const nivel = puntos >= 500 ? "Oro" : puntos >= 200 ? "Plata" : "Bronce";
  const coloresNivel = {
    Bronce: "#CD7F32",
    Plata: "#9E9E9E",
    Oro: tema.dorado,
  };
  const puntosParaSiguiente =
    nivel === "Bronce" ? 200 : nivel === "Plata" ? 500 : 1000;
  const progreso = Math.min((puntos / puntosParaSiguiente) * 100, 100);

  const proxima = RECOMPENSAS.find((r) => r.puntos > puntos);
  const obtenidas = RECOMPENSAS.filter((r) => r.puntos <= puntos);

  return (
    <div style={estilos.contenedor}>
      {/* Cabecera de puntos */}
      <div style={estilos.cabecera}>
        <div style={estilos.infoUsuario}>
          <p style={estilos.saludo}>Hola, {perfil.nombre?.split(" ")[0]}</p>
          <p
            style={{
              fontSize: "0.75rem",
              color: tema.grisMedio,
              margin: "2px 0 0",
              fontFamily: "monospace",
              letterSpacing: "0.1em",
            }}
          >
            ID: #{perfil.codigo_cliente || "—"}
          </p>
          <p style={estilos.subtitulo}>Programa de fidelizacion Tanta</p>
        </div>
        <div
          style={{
            ...estilos.badgeNivel,
            backgroundColor: coloresNivel[nivel],
          }}
        >
          {nivel}
        </div>
      </div>

      {/* Puntos */}
      <div style={estilos.puntosArea}>
        <span style={estilos.puntosNum}>{puntos}</span>
        <span style={estilos.puntosLabel}>puntos acumulados</span>
      </div>

      {/* Barra de progreso */}
      <div style={estilos.barraContenedor}>
        <div
          style={{
            ...estilos.barraProgreso,
            width: `${progreso}%`,
            backgroundColor: coloresNivel[nivel],
          }}
        />
      </div>
      <p style={estilos.metaTexto}>
        {puntos >= 1000
          ? "Nivel maximo alcanzado"
          : `Faltan ${puntosParaSiguiente - puntos} puntos para nivel ${nivel === "Bronce" ? "Plata" : "Oro"}`}
      </p>

      {/* Proxima recompensa */}
      {proxima && (
        <div style={estilos.proximaRecompensa}>
          <p style={estilos.proximaTitulo}>Proxima recompensa</p>
          <div style={estilos.proximaContenido}>
            <div style={{ flex: 1 }}>
              <p style={estilos.proximaNombre}>{proxima.titulo}</p>
              <p style={estilos.proximaDesc}>{proxima.descripcion}</p>
            </div>
            <div style={estilos.proximaPuntos}>
              <span style={estilos.proximaPuntosNum}>{proxima.puntos}</span>
              <span style={estilos.proximaPuntosLabel}>pts</span>
            </div>
          </div>
          <div style={estilos.barraContenedor}>
            <div
              style={{
                ...estilos.barraProgreso,
                width: `${Math.min((puntos / proxima.puntos) * 100, 100)}%`,
                backgroundColor: tema.rojo,
              }}
            />
          </div>
          <p
            style={{
              fontSize: "0.72rem",
              color: tema.grisMedio,
              margin: "4px 0 0",
              textAlign: "right",
            }}
          >
            {puntos} / {proxima.puntos} puntos
          </p>
        </div>
      )}

      {/* Recompensas obtenidas */}
      {obtenidas.length > 0 && (
        <div style={estilos.obtenidas}>
          <p style={estilos.obtenidaSTitulo}>
            Recompensas disponibles para canjear
          </p>
          {obtenidas.map((r, i) => (
            <div key={i} style={estilos.recompensaItem}>
              <div style={{ flex: 1 }}>
                <p style={estilos.recompensaNombre}>{r.titulo}</p>
                <p style={estilos.recompensaDesc}>{r.descripcion}</p>
              </div>
              <span style={estilos.badgeCanjeable}>{r.puntos} pts</span>
            </div>
          ))}
        </div>
      )}

      {/* Todas las recompensas */}
      <div style={estilos.todasRecompensas}>
        <p style={estilos.todasTitulo}>Tabla de recompensas</p>
        {RECOMPENSAS.map((r, i) => {
          const obtenida = puntos >= r.puntos;
          return (
            <div
              key={i}
              style={{ ...estilos.filaRecompensa, opacity: obtenida ? 1 : 0.5 }}
            >
              <div
                style={{
                  ...estilos.circuloPuntos,
                  backgroundColor: obtenida ? tema.rojo : tema.grisClaro,
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    color: obtenida ? "#fff" : tema.grisMedio,
                  }}
                >
                  {r.puntos}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: tema.negro,
                  }}
                >
                  {r.titulo}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: tema.grisMedio,
                  }}
                >
                  {r.descripcion}
                </p>
              </div>
              {obtenida && (
                <span style={estilos.checkObtenida}>Disponible</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Como ganar puntos */}
      <div style={estilos.comoGanar}>
        <p style={estilos.comoGanarTitulo}>Como ganar puntos</p>
        <div style={estilos.comoGanarItem}>
          <span style={estilos.puntosTag}>+10</span> Por cada plato registrado
        </div>
        <div style={estilos.comoGanarItem}>
          <span style={estilos.puntosTag}>+20</span> Por elegir platos
          saludables (bajo en calorias, vegano o apto diabetes)
        </div>
        <div style={estilos.comoGanarItem}>
          <span style={estilos.puntosTag}>+50</span> Por visita semanal continua
        </div>
      </div>
    </div>
  );
}

const estilos = {
  contenedor: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    borderTop: `3px solid ${tema.rojo}`,
    fontFamily: tema.fuenteCuerpo,
  },
  cabecera: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  infoUsuario: {},
  saludo: {
    fontFamily: tema.fuenteTitulo,
    fontSize: "1.1rem",
    fontWeight: "700",
    color: tema.negro,
    margin: "0 0 4px",
  },
  subtitulo: { fontSize: "0.78rem", color: tema.grisMedio, margin: 0 },
  badgeNivel: {
    padding: "5px 14px",
    borderRadius: "20px",
    color: "#fff",
    fontWeight: "700",
    fontSize: "0.82rem",
  },
  puntosArea: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "10px",
  },
  puntosNum: {
    fontSize: "3rem",
    fontWeight: "800",
    color: tema.rojo,
    lineHeight: 1,
    fontFamily: tema.fuenteTitulo,
  },
  puntosLabel: { fontSize: "0.9rem", color: tema.grisMedio },
  barraContenedor: {
    height: "8px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "4px",
  },
  barraProgreso: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.5s",
  },
  metaTexto: {
    fontSize: "0.75rem",
    color: tema.grisMedio,
    margin: "0 0 1.2rem",
  },
  proximaRecompensa: {
    backgroundColor: tema.cremaSuave,
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    border: `1px solid ${tema.grisClaro}`,
  },
  proximaTitulo: {
    fontSize: "0.72rem",
    fontWeight: "700",
    color: tema.grisMedio,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 8px",
  },
  proximaContenido: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  proximaNombre: {
    margin: "0 0 2px",
    fontWeight: "700",
    fontSize: "0.9rem",
    color: tema.negro,
  },
  proximaDesc: { margin: 0, fontSize: "0.78rem", color: tema.grisMedio },
  proximaPuntos: { textAlign: "center", flexShrink: 0 },
  proximaPuntosNum: {
    display: "block",
    fontSize: "1.4rem",
    fontWeight: "800",
    color: tema.rojo,
    lineHeight: 1,
    fontFamily: tema.fuenteTitulo,
  },
  proximaPuntosLabel: { fontSize: "0.7rem", color: tema.grisMedio },
  obtenidas: {
    backgroundColor: "#f0fff4",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    border: "1px solid #c6f6d5",
  },
  obtenidaSTitulo: {
    fontSize: "0.72rem",
    fontWeight: "700",
    color: tema.verde,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 8px",
  },
  recompensaItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid #c6f6d5",
  },
  recompensaNombre: {
    margin: "0 0 2px",
    fontWeight: "600",
    fontSize: "0.85rem",
    color: tema.negro,
  },
  recompensaDesc: { margin: 0, fontSize: "0.75rem", color: tema.grisMedio },
  badgeCanjeable: {
    padding: "4px 10px",
    borderRadius: "20px",
    backgroundColor: tema.verde,
    color: "#fff",
    fontSize: "0.72rem",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  todasRecompensas: {
    borderTop: `1px solid ${tema.grisClaro}`,
    paddingTop: "1rem",
    marginBottom: "1rem",
  },
  todasTitulo: {
    fontSize: "0.72rem",
    fontWeight: "700",
    color: tema.grisMedio,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 10px",
  },
  filaRecompensa: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  circuloPuntos: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    textAlign: "center",
  },
  checkObtenida: {
    fontSize: "0.72rem",
    padding: "3px 8px",
    borderRadius: "20px",
    backgroundColor: "#f0fff4",
    color: tema.verde,
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  comoGanar: { borderTop: `1px solid ${tema.grisClaro}`, paddingTop: "1rem" },
  comoGanarTitulo: {
    fontSize: "0.72rem",
    fontWeight: "700",
    color: tema.grisMedio,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 8px",
  },
  comoGanarItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.82rem",
    color: tema.grisOscuro,
    marginBottom: "6px",
  },
  puntosTag: {
    padding: "2px 8px",
    borderRadius: "20px",
    backgroundColor: tema.cremaSuave,
    color: tema.rojo,
    fontWeight: "700",
    fontSize: "0.78rem",
    whiteSpace: "nowrap",
  },
};
