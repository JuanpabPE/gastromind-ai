from fastapi import APIRouter, Request, HTTPException
from .detector import detectar_alergenos
from menu_digital import repositorio as menu_repo
from perfil_nutricional import servicio as perfil_servicio
from infraestructura.supabase_cliente import supabase

router = APIRouter(prefix="/alertas", tags=["alertas"])

async def get_usuario_id(request: Request):
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token requerido")
    token = auth_header.replace("Bearer ", "").replace("bearer ", "")
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.get("/{plato_id}")
async def verificar_plato(plato_id: str, request: Request):
    usuario_id = await get_usuario_id(request)
    plato = await menu_repo.obtener_plato(plato_id)
    perfil = await perfil_servicio.obtener_perfil(usuario_id)

    if not plato or not perfil:
        raise HTTPException(status_code=404, detail="Plato o perfil no encontrado")

    return detectar_alergenos(plato, perfil)