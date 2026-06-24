from fastapi import APIRouter, HTTPException, status
from infraestructura.supabase_cliente import supabase
from config import settings
from autenticacion.esquemas import RegistroRequest, RegistroResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/registro", response_model=RegistroResponse)
async def registrar_usuario(datos: RegistroRequest):
    """
    Endpoint para registro completo: crea usuario en Auth + guarda perfil
    """
    
    print(f"📥 DATOS RECIBIDOS EN BACKEND:")
    print(f"  - email: {datos.email} (tipo: {type(datos.email)})")
    print(f"  - password: *** (oculto por seguridad)")
    print(f"  - nombre: {datos.nombre} (tipo: {type(datos.nombre)})")
    print(f"  - fecha_nacimiento: {datos.fecha_nacimiento} (tipo: {type(datos.fecha_nacimiento)})")
    print(f"  - alergias: {datos.alergias} (tipo: {type(datos.alergias)})")
    print(f"  - objetivo_calorico: {datos.objetivo_calorico} (tipo: {type(datos.objetivo_calorico)})")
    
    try:
        # 1. Crear usuario en Supabase Auth (DESDE EL BACKEND)
        signup_payload = {
            "email": datos.email,
            "password": datos.password,
            "options": {
                "data": {"nombre": datos.nombre}
            }
        }

        # Si se configuró URL de redirect en .env, incluirla para el email de confirmación
        if settings.supabase_redirect:
            signup_payload["options"]["email_redirect_to"] = settings.supabase_redirect

        signup_response = supabase.auth.sign_up(signup_payload)
        
        if signup_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo crear el usuario en autenticación"
            )
        
        usuario_id = signup_response.user.id
        requiere_verificacion = signup_response.session is None
        codigo_cliente = usuario_id.replace("-", "")[:8].upper()
        # 2. Guardar perfil en tabla "perfiles"
        # (RLS permite INSERT sin autenticación durante registro)
        perfil_data = {
            "usuario_id": usuario_id,
            "nombre": datos.nombre,
            "codigo_cliente": codigo_cliente,
            "fecha_nacimiento": datos.fecha_nacimiento,
            "alergias": datos.alergias,
            "intolerancias": datos.intolerancias,
            "enfermedades": datos.enfermedades,
            "preferencias": datos.preferencias,
            "objetivo_calorico": datos.objetivo_calorico,
            "actualizado_en": "now()"
        }
        
        # Si el usuario ya tenía perfil (reintentos de registro), actualizamos por usuario_id
        # en lugar de fallar por unique constraint.
        perfil_response = (
            supabase
            .table("perfiles")
            .upsert(perfil_data, on_conflict="usuario_id")
            .execute()
        )
        
        if not perfil_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al guardar perfil nutricional"
            )
        
        # 3. Devolver respuesta exitosa
        return RegistroResponse(
            usuario_id=usuario_id,
            email=datos.email,
            requiere_verificacion=requiere_verificacion,
            mensaje="Registro completado exitosamente. Verifica tu email para confirmar."
        )
    
    except Exception as e:
        # Manejo de rate limits y otros errores
        error_str = str(e)
        
        print(f"❌ ERROR EN REGISTRO: {error_str}")
        print(f"🔍 ERROR COMPLETO: {repr(e)}")
        print(f"Datos recibidos: {datos if isinstance(datos, dict) else 'No disponibles'}")
        
        # Log detallado para debugging
        if hasattr(e, '__dict__'):
            print(f"   Atributos del error: {e.__dict__}")
        
        # Manejar rate limits específicos de envío de email (Supabase puede devolver
        # mensajes como "email rate limit exceeded"). Normalizar a 429 para que
        # el frontend no reintente inmediatamente.
        lowered = error_str.lower()
        if "429" in error_str or "too many" in lowered or "rate limit" in lowered or "email rate limit" in lowered:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiados intentos de registro o verificación. Intenta de nuevo en unos minutos."
            )
        elif "user_already_exists" in lowered or "user already exists" in lowered:
            # Usuario ya existe
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado. Usa 'olvidé mi contraseña' o inicia sesión."
            )
        elif "email" in lowered:
            # Otros errores relacionados con email (por ejemplo validación)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error de email: {error_str}"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error en registro: {error_str}"
            )
