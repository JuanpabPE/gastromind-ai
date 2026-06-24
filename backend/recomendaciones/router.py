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
        
        # MODO TESTING: Si no hay token, usa usuario fake
        if not auth_header:
            print("⚠️ Sin token. Usando usuario fake para testing...")
            usuario_id = "fake-user-123"
        else:
            token = auth_header.replace("Bearer ", "").replace("bearer ", "")
            try:
                user = supabase.auth.get_user(token)
                usuario_id = user.user.id
            except Exception as e:
                print(f"⚠️ Token inválido: {str(e)}. Usando usuario fake...")
                usuario_id = "fake-user-123"

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

        # Obtener menú con manejo de errores
        try:
            platos = await menu_repo.obtener_menu()
        except Exception as e:
            print(f"⚠️ Error obteniendo menú: {str(e)}. Usando menú fake...")
            platos = [
                {
                    "id": "1",
                    "nombre": "Ceviche de Pescado",
                    "calorias": 320,
                    "proteinas": 35,
                    "carbohidratos": 12,
                    "grasas": 15,
                    "alergenos": ["Pescado", "Mariscos"],
                    "apto_vegano": False,
                    "apto_vegetariano": False,
                    "apto_sin_gluten": True,
                    "apto_diabetes": True,
                    "apto_hipertension": True,
                    "descripcion": "Ceviche tradicional peruano"
                },
                {
                    "id": "2",
                    "nombre": "Causa Limeña",
                    "calorias": 280,
                    "proteinas": 12,
                    "carbohidratos": 45,
                    "grasas": 8,
                    "alergenos": [],
                    "apto_vegano": False,
                    "apto_vegetariano": True,
                    "apto_sin_gluten": True,
                    "apto_diabetes": False,
                    "apto_hipertension": True,
                    "descripcion": "Papa amarilla con limón y especias"
                },
                {
                    "id": "3",
                    "nombre": "Ensalada Verde",
                    "calorias": 150,
                    "proteinas": 8,
                    "carbohidratos": 18,
                    "grasas": 6,
                    "alergenos": [],
                    "apto_vegano": True,
                    "apto_vegetariano": True,
                    "apto_sin_gluten": True,
                    "apto_diabetes": True,
                    "apto_hipertension": True,
                    "descripcion": "Ensalada fresca de verduras de temporada"
                }
            ]

        # Obtiene historial reciente para no repetir platos
        try:
            historial = await historial_repo.obtener_historial(usuario_id, limite=10)
            historial_ids = [h.get("plato_id") for h in historial if h.get("plato_id")]
        except Exception as e:
            print(f"⚠️ Error obteniendo historial: {str(e)}. Usando historial vacío...")
            historial_ids = []

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
        print(f"❌ ERROR en recomendaciones: {str(e)}")
        # Retorna datos mínimos en caso de error
        return {
            "perfil_nombre": "Demo User",
            "total_recomendaciones": 0,
            "platos": [],
            "error": str(e)
        }