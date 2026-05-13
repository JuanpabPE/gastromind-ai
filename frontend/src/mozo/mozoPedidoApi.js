import { supabase } from "../compartido/api/cliente";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function getToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export async function obtenerMesas(sede) {
  const token = await getToken();
  const res = await fetch(`${API}/pedidos/mesas/${encodeURIComponent(sede)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function abrirPedido(mesaId) {
  const token = await getToken();
  const res = await fetch(`${API}/pedidos/mesas/${mesaId}/abrir`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function obtenerPedidoActivo(mesaId) {
  const token = await getToken();
  const res = await fetch(`${API}/pedidos/mesas/${mesaId}/pedido-activo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  return res.json();
}

export async function obtenerItems(pedidoId) {
  const token = await getToken();
  const res = await fetch(`${API}/pedidos/${pedidoId}/items`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function agregarItem(pedidoId, item) {
  const token = await getToken();
  const res = await fetch(`${API}/pedidos/${pedidoId}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function eliminarItem(pedidoId, itemId) {
  const token = await getToken();
  await fetch(`${API}/pedidos/${pedidoId}/items/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function finalizarPedido(pedidoId, mesaId) {
  const token = await getToken();
  const res = await fetch(`${API}/pedidos/${pedidoId}/finalizar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mesa_id: mesaId }),
  });
  return res.json();
}
