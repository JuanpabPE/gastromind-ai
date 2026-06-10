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
        
        # MODO TESTING: Si no hay token, usa usuario fake
        if not auth_header:
            print("Sin token. Usando usuario fake para testing...")
            usuario_id = "fake-user-123"
        else:
            token = auth_header.replace("Bearer ", "").replace("bearer ", "")
            try:
                user = supabase.auth.get_user(token)
                usuario_id = user.user.id
            except Exception as e:
                print(f"⚠️ Token inválido: {str(e)}. Usando usuario fake...")
                usuario_id = "fake-user-123"
        
        print(f"=== usuario_id: {usuario_id} ===")

        perfil = await perfil_servicio.obtener_perfil(usuario_id)
        
        # MODO TESTING: Si no hay perfil en BD, usa perfil fake
        if not perfil:
            print("⚠️ Sin perfil en BD. Usando perfil fake para testing...")
            perfil = {
                "nombre": "Demo User",
                "alergias": ["Lactosa"],
                "intolerancias": [],
                "enfermedades": ["Ninguna"],
                "preferencias": ["Vegano"],
                "objetivo_calorico": 2000
            }
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