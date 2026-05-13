from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from . import repositorio
from infraestructura.supabase_cliente import supabase
import traceback

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

class ItemInput(BaseModel):
    plato_id: str
    plato_nombre: str
    calorias: int
    precio: float
    usuario_id: Optional[str] = None
    usuario_nombre: Optional[str] = None
    puntos_ganados: int = 10

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

@router.get("/mesas/{sede}")
async def obtener_mesas(sede: str, request: Request):
    await get_usuario_id(request)
    mesas = await repositorio.obtener_mesas(sede)
    return mesas

@router.post("/mesas/{mesa_id}/abrir")
async def abrir_pedido(mesa_id: str, request: Request):
    await get_usuario_id(request)
    pedido = await repositorio.abrir_pedido(mesa_id)
    return pedido

@router.get("/mesas/{mesa_id}/pedido-activo")
async def pedido_activo(mesa_id: str):
    pedido = await repositorio.obtener_pedido_activo(mesa_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="No hay pedido activo")
    return pedido

@router.get("/mesa-por-ubicacion/{sede}/{numero}")
async def mesa_por_ubicacion(sede: str, numero: int):
    mesa = await repositorio.obtener_mesa_por_numero_sede(numero, sede)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    return mesa

@router.post("/{pedido_id}/items")
async def agregar_item(pedido_id: str, item: ItemInput, request: Request):
    await get_usuario_id(request)
    resultado = await repositorio.agregar_item(pedido_id, item.model_dump())
    return resultado

@router.get("/{pedido_id}/items")
async def obtener_items(pedido_id: str, request: Request):
    await get_usuario_id(request)
    return await repositorio.obtener_items(pedido_id)

@router.delete("/{pedido_id}/items/{item_id}")
async def eliminar_item(pedido_id: str, item_id: str, request: Request):
    await get_usuario_id(request)
    await repositorio.eliminar_item(item_id)
    return {"ok": True}

@router.post("/{pedido_id}/finalizar")
async def finalizar(pedido_id: str, request: Request):
    await get_usuario_id(request)
    body = await request.json()
    mesa_id = body.get("mesa_id")
    if not mesa_id:
        raise HTTPException(status_code=400, detail="mesa_id requerido")
    await repositorio.finalizar_pedido(pedido_id, mesa_id)
    return {"ok": True, "mensaje": "Pedido finalizado y mesa liberada"}

@router.post("/unirse/{mesa_id}")
async def unirse(mesa_id: str, request: Request):
    usuario_id = await get_usuario_id(request)
    body = await request.json()
    data = await repositorio.unirse_a_pedido(mesa_id, usuario_id, body.get("nombre", ""))
    return data