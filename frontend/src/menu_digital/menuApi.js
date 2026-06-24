import { supabase } from "../compartido/api/cliente";

export async function obtenerMenu(filtros = {}) {
  let query = supabase
    .from("menu")
    .select("*")
    .eq("disponible", true)
    .order("categoria");

  if (filtros.categoria) query = query.eq("categoria", filtros.categoria);
  if (filtros.vegetariano) query = query.eq("apto_vegetariano", true);
  if (filtros.vegano) query = query.eq("apto_vegano", true);
  if (filtros.sinGluten) query = query.eq("apto_sin_gluten", true);
  if (filtros.diabetes) query = query.eq("apto_diabetes", true);
  if (filtros.hipertension) query = query.eq("apto_hipertension", true);
  if (filtros.caloriasMax) query = query.lte("calorias", filtros.caloriasMax);
  if (filtros.proteinasMin && filtros.proteinasMin > 0)
    query = query.gte("proteinas", filtros.proteinasMin);
  if (filtros.busqueda) query = query.ilike("nombre", `%${filtros.busqueda}%`);

  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function obtenerCategorias() {
  const { data, error } = await supabase
    .from("menu")
    .select("categoria")
    .eq("disponible", true);
  if (error) return [];
  return [...new Set(data.map((d) => d.categoria))];
}
