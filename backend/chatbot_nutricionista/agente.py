from infraestructura.groq_cliente import groq_client
from infraestructura.supabase_cliente import supabase
from .prompts import SISTEMA_NUTRICIONISTA, construir_contexto_perfil

def obtener_menu_texto() -> str:
    response = supabase.table("menu")\
        .select("nombre, categoria, calorias, alergenos, apto_vegetariano, apto_vegano, apto_sin_gluten, apto_diabetes, apto_hipertension, precio")\
        .eq("disponible", True)\
        .execute()
    
    platos = response.data or []
    lineas = []
    
    categoria_actual = ""
    for p in sorted(platos, key=lambda x: x.get("categoria", "")):
        if p["categoria"] != categoria_actual:
            categoria_actual = p["categoria"]
            lineas.append(f"\n[{categoria_actual}]")
        
        alergenos = ", ".join(p.get("alergenos") or []) or "ninguno"
        restricciones = []
        if p.get("apto_vegetariano"): restricciones.append("vegetariano")
        if p.get("apto_vegano"): restricciones.append("vegano")
        if p.get("apto_sin_gluten"): restricciones.append("sin gluten")
        if p.get("apto_diabetes"): restricciones.append("apto diabetes")
        if p.get("apto_hipertension"): restricciones.append("apto hipertensión")
        
        lineas.append(
            f"- {p['nombre']} | S/.{p['precio']} | {p['calorias']} kcal | "
            f"Prot: {p['proteinas']}g | Carbs: {p['carbohidratos']}g | Grasas: {p['grasas']}g | "
            f"Alérgenos: {alergenos} | {', '.join(restricciones) if restricciones else 'sin restricciones'}"
        )
    
    return "\n".join(lineas)

async def responder(mensaje: str, perfil: dict, historial: list = []) -> str:
    contexto_perfil = construir_contexto_perfil(perfil)
    menu_texto = obtener_menu_texto()

    sistema = f"""{SISTEMA_NUTRICIONISTA}

PERFIL DEL COMENSAL:
{contexto_perfil}

CARTA ACTUAL DE TANTA (SOLO recomienda platos de esta lista):
{menu_texto}

REGLAS IMPORTANTES:
- Solo recomienda platos que aparecen en la carta anterior
- Nunca inventes platos que no estén en la lista
- Si el comensal tiene alergias, nunca recomiendes platos con esos alérgenos
- Siempre menciona las calorías y el precio del plato que recomiendes
"""

    mensajes = historial + [{"role": "user", "content": mensaje}]

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": sistema}] + mensajes,
        max_tokens=300,
        temperature=0.7,
    )

    return response.choices[0].message.content