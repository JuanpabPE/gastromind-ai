from infraestructura.groq_cliente import groq_client
from .prompts import SISTEMA_NUTRICIONISTA, construir_contexto_perfil

async def responder(
    mensaje: str,
    perfil: dict,
    historial: list = []
) -> str:
    contexto_perfil = construir_contexto_perfil(perfil)

    sistema = f"{SISTEMA_NUTRICIONISTA}\n\nPerfil del comensal:\n{contexto_perfil}"

    mensajes = historial + [{"role": "user", "content": mensaje}]

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": sistema}] + mensajes,
        max_tokens=512,
        temperature=0.7,
    )

    return response.choices[0].message.content