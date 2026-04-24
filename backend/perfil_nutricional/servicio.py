from . import repositorio
from .esquemas import PerfilInput

async def guardar_perfil(usuario_id: str, datos: PerfilInput):
    return await repositorio.guardar_perfil(
        usuario_id,
        datos.model_dump(exclude_none=True)
    )

async def obtener_perfil(usuario_id: str):
    return await repositorio.obtener_perfil(usuario_id)