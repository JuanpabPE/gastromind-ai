from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from . import repositorio
from infraestructura.supabase_cliente import supabase

router = APIRouter(prefix="/historial", tags=["historial"])

class ConsumoInput(BaseModel):
    plato_id: str
    plato_nombre: str
    calorias: int
    proteinas: float
    carbohidratos: float
    grasas: float
    sede: Optional[str] = "Surco"

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

@router.post("/")
async def registrar(request: Request):
    usuario_id = await get_usuario_id(request)
    body = await request.json()
    datos = ConsumoInput(**body)
    resultado = await repositorio.registrar_consumo(usuario_id, datos.model_dump())
    return resultado

@router.get("/")
async def obtener(request: Request):
    usuario_id = await get_usuario_id(request)
    historial = await repositorio.obtener_historial(usuario_id)
    return historial

@router.get("/resumen")
async def resumen(request: Request):
    usuario_id = await get_usuario_id(request)
    return await repositorio.obtener_resumen(usuario_id)