from fastapi import APIRouter, Request, HTTPException
from .motor_ia import recomendar_platos
from menu_digital import repositorio as menu_repo
from perfil_nutricional import servicio as perfil_servicio
from historial_consumo import repositorio as historial_repo
from infraestructura.supabase_cliente import supabase
import traceback

router = APIRouter(prefix="/recomendaciones", tags=["recomendaciones"])

@router.get("/")
async def obtener_recomendaciones(request: Request):
    try:
        auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Token requerido")
        token = auth_header.replace("Bearer ", "").replace("bearer ", "")
        user = supabase.auth.get_user(token)
        usuario_id = user.user.id

        perfil = await perfil_servicio.obtener_perfil(usuario_id)
        if not perfil:
            raise HTTPException(status_code=404, detail="Completa tu perfil primero")

        platos = await menu_repo.obtener_menu()

        # Obtiene historial reciente para no repetir platos
        historial = await historial_repo.obtener_historial(usuario_id, limite=10)
        historial_ids = [h.get("plato_id") for h in historial if h.get("plato_id")]

        recomendaciones = recomendar_platos(platos, perfil, historial_ids)

        return {
            "perfil_nombre": perfil.get("nombre"),
            "total_recomendaciones": len(recomendaciones),
            "platos": recomendaciones
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))