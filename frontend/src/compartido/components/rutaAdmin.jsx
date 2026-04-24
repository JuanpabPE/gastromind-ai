import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../api/cliente";

export default function RutaAdmin({ children }) {
  const [estado, setEstado] = useState("cargando");

  useEffect(() => {
    async function verificar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setEstado("no_autorizado");
        return;
      }

      const { data } = await supabase
        .from("perfiles")
        .select("es_admin")
        .eq("usuario_id", user.id)
        .single();

      setEstado(data?.es_admin ? "autorizado" : "no_autorizado");
    }
    verificar();
  }, []);

  if (estado === "cargando")
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "#888" }}>
        Verificando permisos...
      </div>
    );

  if (estado === "no_autorizado") return <Navigate to="/menu" />;

  return children;
}
