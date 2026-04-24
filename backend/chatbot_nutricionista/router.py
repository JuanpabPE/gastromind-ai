from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List
from .agente import responder
from perfil_nutricional import servicio as perfil_servicio
from infraestructura.supabase_cliente import supabase
import traceback

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class MensajeInput(BaseModel):
    mensaje: str
    historial: List[dict] = []

@router.post("/")
async def chatear(request: Request):
    try:
        print("=== CHATBOT: inicio ===")
        
        datos = MensajeInput(**(await request.json()))
        
        auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
        print(f"=== auth_header presente: {auth_header is not None} ===")
        
        if not auth_header:
            raise HTTPException(status_code=401, detail="Token requerido")
        
        token = auth_header.replace("Bearer ", "").replace("bearer ", "")
        
        user = supabase.auth.get_user(token)
        usuario_id = user.user.id
        print(f"=== usuario_id: {usuario_id} ===")

        perfil = await perfil_servicio.obtener_perfil(usuario_id)
        print(f"=== perfil: {perfil is not None} ===")

        respuesta = await responder(
            mensaje=datos.mensaje,
            perfil=perfil or {},
            historial=datos.historial
        )
        print(f"=== respuesta generada ===")

        return {
            "respuesta": respuesta,
            "historial": datos.historial + [
                {"role": "user", "content": datos.mensaje},
                {"role": "assistant", "content": respuesta}
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"=== ERROR chatbot: {e} ===")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))