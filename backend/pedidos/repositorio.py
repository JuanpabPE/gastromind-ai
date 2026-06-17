from infraestructura.supabase_cliente import supabase

async def obtener_mesas(sede: str):
    print(f"Buscando mesas para sede: '{sede}'")
    response = supabase.table("mesas")\
        .select("*, pedidos(id, estado, creado_en)")\
        .eq("sede", sede)\
        .order("numero")\
        .execute()
    print(f"Resultado: {len(response.data or [])} mesas")
    return response.data or []

async def abrir_pedido(mesa_id: str) -> dict:
    # Crea el pedido
    pedido = supabase.table("pedidos")\
        .insert({"mesa_id": mesa_id, "estado": "abierto"})\
        .execute()
    pedido_id = pedido.data[0]["id"]

    # Actualiza la mesa
    supabase.table("mesas")\
        .update({"estado": "ocupada", "pedido_activo_id": pedido_id})\
        .eq("id", mesa_id)\
        .execute()

    return pedido.data[0]

async def obtener_pedido_activo(mesa_id: str) -> dict:
    mesa = supabase.table("mesas")\
        .select("pedido_activo_id")\
        .eq("id", mesa_id)\
        .single()\
        .execute()
    
    pedido_id = mesa.data.get("pedido_activo_id")
    if not pedido_id:
        return None

    pedido = supabase.table("pedidos")\
        .select("*")\
        .eq("id", pedido_id)\
        .single()\
        .execute()
    return pedido.data

async def agregar_item(pedido_id: str, item: dict) -> dict:
    response = supabase.table("pedido_items")\
        .insert({"pedido_id": pedido_id, **item})\
        .execute()
    return response.data[0]

async def obtener_items(pedido_id: str) -> list:
    response = supabase.table("pedido_items")\
        .select("*")\
        .eq("pedido_id", pedido_id)\
        .order("creado_en")\
        .execute()
    return response.data or []

async def eliminar_item(item_id: str):
    supabase.table("pedido_items")\
        .delete()\
        .eq("id", item_id)\
        .execute()

async def finalizar_pedido(pedido_id: str, mesa_id: str):
    from datetime import datetime, timezone
    
    # Obtiene items con usuario_id para sumar puntos
    items = supabase.table("pedido_items")\
        .select("*")\
        .eq("pedido_id", pedido_id)\
        .execute()

    # Suma puntos a cada usuario registrado
    puntos_por_usuario = {}
    for item in items.data or []:
        uid = item.get("usuario_id")
        if uid:
            puntos_por_usuario[uid] = puntos_por_usuario.get(uid, 0) + item.get("puntos_ganados", 0)

    for uid, puntos in puntos_por_usuario.items():
        perfil = supabase.table("perfiles")\
            .select("puntos_fidelidad")\
            .eq("usuario_id", uid)\
            .single()\
            .execute()
        actuales = perfil.data.get("puntos_fidelidad", 0) if perfil.data else 0
        supabase.table("perfiles")\
            .update({"puntos_fidelidad": actuales + puntos})\
            .eq("usuario_id", uid)\
            .execute()

    # Registra en historial cada item con usuario
    # Obtener sede de la mesa para registrar correctamente
    mesa_resp = supabase.table("mesas").select("sede").eq("id", mesa_id).single().execute()
    sede_actual = mesa_resp.data.get("sede") if mesa_resp and mesa_resp.data else "Sin especificar"

    for item in items.data or []:
        if item.get("usuario_id") and item.get("plato_id"):
            supabase.table("historial").insert({
                "usuario_id": item["usuario_id"],
                "plato_id": item["plato_id"],
                "plato_nombre": item["plato_nombre"],
                "calorias": item.get("calorias", 0),
                "proteinas": 0,
                "carbohidratos": 0,
                "grasas": 0,
                "sede": sede_actual
            }).execute()

    # Cierra el pedido y libera la mesa
    supabase.table("pedidos")\
        .update({
            "estado": "finalizado",
            "finalizado_en": datetime.now(timezone.utc).isoformat()
        })\
        .eq("id", pedido_id)\
        .execute()

    supabase.table("mesas")\
        .update({"estado": "libre", "pedido_activo_id": None})\
        .eq("id", mesa_id)\
        .execute()

async def unirse_a_pedido(mesa_id: str, usuario_id: str, nombre: str) -> dict:
    mesa = supabase.table("mesas")\
        .select("pedido_activo_id, estado")\
        .eq("id", mesa_id)\
        .single()\
        .execute()
    
    pedido_id = mesa.data.get("pedido_activo_id")
    if not pedido_id:
        return mesa.data

    # Obtener clientes actuales
    pedido = supabase.table("pedidos")\
        .select("clientes_unidos")\
        .eq("id", pedido_id)\
        .single()\
        .execute()
    
    clientes = pedido.data.get("clientes_unidos") or []
    
    # Agregar si no está ya
    if not any(c["id"] == usuario_id for c in clientes):
        clientes.append({"id": usuario_id, "nombre": nombre})
        supabase.table("pedidos")\
            .update({"clientes_unidos": clientes})\
            .eq("id", pedido_id)\
            .execute()

    return mesa.data

async def obtener_mesa_por_numero_sede(numero: int, sede: str) -> dict:
    print(f"Buscando mesa: sede='{sede}', numero={numero}")
    response = supabase.table("mesas")\
        .select("*")\
        .eq("numero", numero)\
        .eq("sede", sede)\
        .single()\
        .execute()
    return response.data