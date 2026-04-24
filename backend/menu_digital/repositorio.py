from infraestructura.supabase_cliente import supabase

async def obtener_menu(filtros: dict = {}):
    query = supabase.table("menu").select("*").eq("disponible", True)

    if filtros.get("categoria"):
        query = query.eq("categoria", filtros["categoria"])
    if filtros.get("vegetariano"):
        query = query.eq("apto_vegetariano", True)
    if filtros.get("vegano"):
        query = query.eq("apto_vegano", True)
    if filtros.get("sin_gluten"):
        query = query.eq("apto_sin_gluten", True)
    if filtros.get("diabetes"):
        query = query.eq("apto_diabetes", True)
    if filtros.get("hipertension"):
        query = query.eq("apto_hipertension", True)
    if filtros.get("calorias_max"):
        query = query.lte("calorias", filtros["calorias_max"])

    response = query.execute()
    return response.data

async def obtener_plato(plato_id: str):
    response = supabase.table("menu")\
        .select("*")\
        .eq("id", plato_id)\
        .single()\
        .execute()
    return response.data