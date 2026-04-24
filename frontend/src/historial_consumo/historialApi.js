import { supabase } from "../compartido/api/cliente";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function getToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export async function registrarConsumo(plato) {
  const token = await getToken();
  await fetch(`${API}/historial/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      plato_id: plato.id,
      plato_nombre: plato.nombre,
      calorias: plato.calorias,
      proteinas: plato.proteinas,
      carbohidratos: plato.carbohidratos,
      grasas: plato.grasas,
      sede: "Surco",
    }),
  });

  // Suma puntos — 10 base, +10 extra si es saludable
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const puntosGanados =
    plato.apto_diabetes || plato.apto_vegetariano || plato.calorias < 400
      ? 20
      : 10;

  const { data: perfilActual } = await supabase
    .from("perfiles")
    .select("puntos_fidelidad")
    .eq("usuario_id", user.id)
    .single();

  const puntosActuales = perfilActual?.puntos_fidelidad || 0;

  await supabase
    .from("perfiles")
    .update({ puntos_fidelidad: puntosActuales + puntosGanados })
    .eq("usuario_id", user.id);

  return puntosGanados;
}

export async function obtenerHistorial() {
  const token = await getToken();
  const res = await fetch(`${API}/historial/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function obtenerResumen() {
  const token = await getToken();
  const res = await fetch(`${API}/historial/resumen`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
