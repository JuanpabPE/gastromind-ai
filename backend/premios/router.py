from fastapi import APIRouter, Request, HTTPException
from infraestructura.supabase_cliente import supabase

router = APIRouter(prefix="/premios", tags=["premios"])

@router.get("/")
async def listar_premios():
    res = supabase.table("premios").select("*").eq("activo", True).order("puntos_requeridos").execute()
    return res.data or []

@router.post("/canjear")
async def canjear_premio(request: Request):
    body = await request.json()
    usuario_id = body.get("usuario_id")
    premio_id = body.get("premio_id")
    mozo_nombre = body.get("mozo_nombre", "Mozo")

    if not usuario_id or not premio_id:
        raise HTTPException(status_code=400, detail="usuario_id y premio_id requeridos")

    # Obtener premio
    premio = supabase.table("premios").select("*").eq("id", premio_id).single().execute()
    if not premio.data:
        raise HTTPException(status_code=404, detail="Premio no encontrado")
    
    puntos_requeridos = premio.data["puntos_requeridos"]

    # Verificar puntos del cliente
    perfil = supabase.table("perfiles").select("puntos_fidelidad, nombre").eq("usuario_id", usuario_id).single().execute()
    if not perfil.data:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    puntos_actuales = perfil.data.get("puntos_fidelidad", 0)
    if puntos_actuales < puntos_requeridos:
        raise HTTPException(status_code=400, detail=f"Puntos insuficientes. Tiene {puntos_actuales}, necesita {puntos_requeridos}")

    canje_previo = supabase.table("canjes")\
        .select("id")\
        .eq("usuario_id", usuario_id)\
        .eq("premio_id", premio_id)\
     .execute()

    if canje_previo.data:
        raise HTTPException(status_code=400, detail="Ya canjeaste este premio anteriormente.")

    # Descontar puntos
    supabase.table("perfiles").update({"puntos_fidelidad": puntos_actuales - puntos_requeridos}).eq("usuario_id", usuario_id).execute()

    # Registrar canje
    supabase.table("canjes").insert({
        "usuario_id": usuario_id,
        "premio_id": premio_id,
        "puntos_usados": puntos_requeridos,
        "canjeado_por": mozo_nombre,
        "estado": "canjeado"
    }).execute()

    return {
        "ok": True,
        "mensaje": f"Premio '{premio.data['nombre']}' canjeado exitosamente",
        "puntos_restantes": puntos_actuales - puntos_requeridos
    }