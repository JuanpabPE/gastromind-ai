from infraestructura.supabase_cliente import supabase
from infraestructura.groq_cliente import groq_client
import json

def construir_descripcion_perfil(perfil: dict) -> str:
    partes = []
    if perfil.get("alergias"):
        partes.append(f"Tiene alergias a: {', '.join(perfil['alergias'])}")
    if perfil.get("enfermedades"):
        partes.append(f"Condiciones de salud: {', '.join(perfil['enfermedades'])}")
    if perfil.get("preferencias"):
        partes.append(f"Preferencias alimentarias: {', '.join(perfil['preferencias'])}")
    if perfil.get("objetivo_calorico"):
        partes.append(f"Objetivo calórico diario: {perfil['objetivo_calorico']} kcal")
    return ". ".join(partes) if partes else "Sin restricciones especiales"

def construir_descripcion_plato(plato: dict) -> str:
    restricciones = []
    if plato.get("apto_vegetariano"): restricciones.append("vegetariano")
    if plato.get("apto_vegano"): restricciones.append("vegano")
    if plato.get("apto_sin_gluten"): restricciones.append("sin gluten")
    if plato.get("apto_diabetes"): restricciones.append("apto para diabetes")
    if plato.get("apto_hipertension"): restricciones.append("apto para hipertensión")
    alergenos = ", ".join(plato.get("alergenos") or []) or "ninguno"

    return (
        f"{plato['nombre']}: {plato.get('descripcion', '')}. "
        f"Contiene {plato.get('calorias')} calorías, {plato.get('proteinas')}g proteínas, "
        f"{plato.get('carbohidratos')}g carbohidratos, {plato.get('grasas')}g grasas. "
        f"Alérgenos: {alergenos}. "
        f"{'Es ' + ', '.join(restricciones) + '.' if restricciones else ''}"
    )

def recomendar_con_ia(platos: list, perfil: dict, historial_ids: list = [], top: int = 5) -> list:
    # Filtra primero los platos con alérgenos peligrosos — esto es innegociable
    alergias = [a.lower() for a in perfil.get("alergias", []) if a != "Ninguna"]
    platos_seguros = []
    for plato in platos:
        alergenos_plato = [a.lower() for a in (plato.get("alergenos") or [])]
        if any(a in alergenos_plato for a in alergias):
            continue
        platos_seguros.append(plato)

    if not platos_seguros:
        return []

    # Construye el prompt para que Groq decida el ranking
    perfil_texto = construir_descripcion_perfil(perfil)
    
    # Limita a 30 platos para no exceder tokens
    platos_muestra = platos_seguros[:30]
    platos_texto = "\n".join([
        f"{i+1}. {construir_descripcion_plato(p)}"
        for i, p in enumerate(platos_muestra)
    ])

    historial_nombres = [
        p["nombre"] for p in platos
        if p.get("id") in historial_ids
    ]
    historial_texto = f"Platos consumidos recientemente (evitar repetir): {', '.join(historial_nombres)}" if historial_nombres else ""

    prompt = f"""Eres un sistema de recomendación nutricional experto.

PERFIL DEL COMENSAL:
{perfil_texto}

{historial_texto}

PLATOS DISPONIBLES:
{platos_texto}

Selecciona los {top} platos MÁS ADECUADOS para este comensal considerando:
1. Sus condiciones de salud y restricciones alimentarias
2. Su objetivo calórico
3. Sus preferencias alimentarias
4. Variedad (no repetir platos del historial)

Responde ÚNICAMENTE con un JSON válido con este formato exacto, sin texto adicional:
{{
  "recomendaciones": [
    {{
      "numero": 1,
      "nombre": "nombre exacto del plato",
      "explicacion": "Por qué este plato es ideal para el perfil del comensal en una oración"
    }}
  ]
}}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024,
            temperature=0.3,
        )

        texto = response.choices[0].message.content.strip()
        # Limpia posibles backticks
        if "```" in texto:
            texto = texto.split("```")[1]
            if texto.startswith("json"):
                texto = texto[4:]

        data = json.loads(texto)
        recomendaciones_ia = data.get("recomendaciones", [])

        # Mapea los nombres de vuelta a los objetos completos
        resultado = []
        for rec in recomendaciones_ia:
            nombre = rec.get("nombre", "").lower()
            plato_encontrado = next(
                (p for p in platos_seguros if p["nombre"].lower() == nombre),
                None
            )
            if plato_encontrado:
                resultado.append({
                    **plato_encontrado,
                    "score_recomendacion": (top - len(resultado)) * 20,
                    "explicacion": rec.get("explicacion", "")
                })

        return resultado[:top]

    except Exception as e:
        print(f"Error en IA de recomendaciones: {e}")
        # Fallback a reglas si Groq falla
        return fallback_reglas(platos_seguros, perfil, historial_ids, top)

def fallback_reglas(platos: list, perfil: dict, historial_ids: list, top: int) -> list:
    enfermedades = perfil.get("enfermedades", [])
    preferencias = perfil.get("preferencias", [])

    scored = []
    for plato in platos:
        score = 100.0
        if plato.get("id") in historial_ids:
            score -= 40
        if "Vegano" in preferencias and plato.get("apto_vegano"):
            score += 30
        if "Vegetariano" in preferencias and plato.get("apto_vegetariano"):
            score += 20
        if "Diabetes" in enfermedades and plato.get("apto_diabetes"):
            score += 25
        if "Hipertensión" in enfermedades and plato.get("apto_hipertension"):
            score += 25
        scored.append({
            **plato,
            "score_recomendacion": score,
            "explicacion": f"Contiene {plato.get('calorias')} kcal y {plato.get('proteinas')}g de proteínas."
        })

    scored.sort(key=lambda x: x["score_recomendacion"], reverse=True)
    return scored[:top]

# Función principal que llama el router
def recomendar_platos(platos: list, perfil: dict, historial_ids: list = [], top: int = 5) -> list:
    return recomendar_con_ia(platos, perfil, historial_ids, top)