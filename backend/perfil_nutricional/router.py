from fastapi import APIRouter, Request, HTTPException
from .esquemas import PerfilInput
from . import servicio
from infraestructura.supabase_cliente import supabase

router = APIRouter(prefix="/perfil", tags=["perfil"])

async def get_usuario_id(request: Request):
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token requerido")
    token = auth_header.replace("Bearer ", "").replace("bearer ", "")
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.get("/")
async def obtener_perfil(request: Request):
    usuario_id = await get_usuario_id(request)
    perfil = await servicio.obtener_perfil(usuario_id)
    return perfil

@router.post("/")
async def guardar_perfil(request: Request):
    usuario_id = await get_usuario_id(request)
    body = await request.json()
    datos = PerfilInput(**body)
    perfil = await servicio.guardar_perfil(usuario_id, datos)
    return perfil