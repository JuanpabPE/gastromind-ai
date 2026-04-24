from fastapi import APIRouter, Request, HTTPException
from .motor_ia import recomendar_platos
from menu_digital import repositorio as menu_repo
from perfil_nutricional import servicio as perfil_servicio
from infraestructura.supabase_cliente import supabase
import traceback

router = APIRouter(prefix="/recomendaciones", tags=["recomendaciones"])

@router.get("/")
async def obtener_recomendaciones(request: Request):
    try:
        print("=== RECOMENDACIONES: inicio ===")
        
        # Leer el token directamente del request
        auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
        print(f"=== auth_header: {auth_header[:30] if auth_header else 'NONE'} ===")
        
        if not auth_header:
            raise HTTPException(status_code=401, detail="Token requerido")
        
        token = auth_header.replace("Bearer ", "").replace("bearer ", "")
        
        user = supabase.auth.get_user(token)
        print(f"=== user completo: {user} ===")
        usuario_id = user.user.id
        print(f"=== usuario_id extraído: {usuario_id} ===")

        perfil = await perfil_servicio.obtener_perfil(usuario_id)
        print(f"=== perfil obtenido: {perfil is not None} ===")

        if not perfil:
            raise HTTPException(status_code=404, detail="Completa tu perfil primero")

        platos = await menu_repo.obtener_menu()
        print(f"=== platos: {len(platos)} ===")

        recomendaciones = recomendar_platos(platos, perfil)
        print(f"=== recomendaciones: {len(recomendaciones)} ===")

        return {
            "perfil_nombre": perfil.get("nombre"),
            "total_recomendaciones": len(recomendaciones),
            "platos": recomendaciones
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"=== ERROR: {e} ===")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))