export default function BurbujaMensaje({ mensaje }) {
  const esUsuario = mensaje.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: esUsuario ? "flex-end" : "flex-start",
        marginBottom: "12px",
      }}
    >
      {!esUsuario && <div style={estilos.avatar}>🍽️</div>}
      <div
        style={{
          ...estilos.burbuja,
          backgroundColor: esUsuario ? "#c8a96e" : "#f5f0eb",
          color: esUsuario ? "#fff" : "#1a1a1a",
          borderRadius: esUsuario ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          maxWidth: "75%",
        }}
      >
        <p style={estilos.texto}>{mensaje.content}</p>
      </div>
      {esUsuario && <div style={estilos.avatarUsuario}>👤</div>}
    </div>
  );
}

const estilos = {
  burbuja: { padding: "10px 14px" },
  texto: { margin: 0, fontSize: "0.9rem", lineHeight: "1.5" },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    marginRight: "8px",
    flexShrink: 0,
    border: "1px solid #e0e0e0",
  },
  avatarUsuario: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#c8a96e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    marginLeft: "8px",
    flexShrink: 0,
  },
};
