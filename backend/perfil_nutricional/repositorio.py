from infraestructura.supabase_cliente import supabase

async def guardar_perfil(usuario_id: str, datos: dict):
    response = supabase.table("perfiles").upsert(
        {"usuario_id": usuario_id, **datos},
        on_conflict="usuario_id"
    ).execute()
    return response.data[0] if response.data else None

async def obtener_perfil(usuario_id: str):
    try:
        response = supabase.table("perfiles")\
            .select("*")\
            .eq("usuario_id", usuario_id)\
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error obteniendo perfil: {e}")
        return None