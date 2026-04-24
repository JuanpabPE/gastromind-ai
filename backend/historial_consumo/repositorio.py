from infraestructura.supabase_cliente import supabase

async def registrar_consumo(usuario_id: str, datos: dict):
    response = supabase.table("historial").insert({
        "usuario_id": usuario_id,
        **datos
    }).execute()
    return response.data[0] if response.data else None

async def obtener_historial(usuario_id: str, limite: int = 20):
    response = supabase.table("historial")\
        .select("*")\
        .eq("usuario_id", usuario_id)\
        .order("fecha", desc=True)\
        .limit(limite)\
        .execute()
    return response.data or []

async def obtener_resumen(usuario_id: str):
    response = supabase.table("historial")\
        .select("calorias, proteinas, carbohidratos, grasas, fecha")\
        .eq("usuario_id", usuario_id)\
        .order("fecha", desc=True)\
        .limit(30)\
        .execute()
    
    registros = response.data or []
    
    if not registros:
        return {
            "total_visitas": 0,
            "calorias_promedio": 0,
            "plato_mas_pedido": None,
            "registros": []
        }
    
    total_calorias = sum(r.get("calorias", 0) for r in registros)
    
    return {
        "total_visitas": len(registros),
        "calorias_promedio": round(total_calorias / len(registros)),
        "calorias_total": total_calorias,
        "registros": registros
    }