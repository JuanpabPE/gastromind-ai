from infraestructura.groq_cliente import groq_client
import json

def detectar_alergenos(plato: dict, perfil: dict) -> dict:
    alergenos_plato = [a.lower() for a in (plato.get("alergenos") or [])]
    alergias_usuario = [a.lower() for a in (perfil.get("alergias") or []) if a != "Ninguna"]
    enfermedades = perfil.get("enfermedades", [])

    # Detección directa de alérgenos — esto siempre se hace, es seguridad crítica
    alergenos_encontrados = [a for a in alergias_usuario if a in alergenos_plato]

    advertencias = []

    if alergenos_encontrados:
        advertencias.append({
            "tipo": "alergeno",
            "nivel": "peligro",
            "mensaje": f"Este plato contiene: {', '.join(alergenos_encontrados)}. No es seguro para ti."
        })

    # IA analiza compatibilidad nutricional más allá de los alérgenos
    try:
        prompt = f"""Analiza si este plato es compatible con el perfil de salud del comensal.

PLATO: {plato.get('nombre')}
Descripción: {plato.get('descripcion', '')}
Calorías: {plato.get('calorias')} kcal
Proteínas: {plato.get('proteinas')}g
Carbohidratos: {plato.get('carbohidratos')}g
Grasas: {plato.get('grasas')}g
Alérgenos declarados: {', '.join(alergenos_plato) or 'ninguno'}

PERFIL DEL COMENSAL:
Condiciones de salud: {', '.join(enfermedades) if enfermedades else 'ninguna'}
Alergias: {', '.join(alergias_usuario) if alergias_usuario else 'ninguna'}

Responde ÚNICAMENTE con JSON válido sin texto adicional:
{{
  "es_compatible": true o false,
  "nivel": "seguro" o "precaucion" o "peligro",
  "mensaje": "Una oración explicando si es compatible y por qué"
}}"""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.1,
        )

        texto = response.choices[0].message.content.strip()
        if "```" in texto:
            texto = texto.split("```")[1]
            if texto.startswith("json"):
                texto = texto[4:]

        data = json.loads(texto)

        if not data.get("es_compatible") and data.get("nivel") != "seguro":
            advertencias.append({
                "tipo": "compatibilidad_ia",
                "nivel": data.get("nivel", "precaucion"),
                "mensaje": data.get("mensaje", "")
            })

    except Exception as e:
        print(f"Error en IA de alertas: {e}")
        # Fallback a reglas básicas
        if "Diabetes" in enfermedades and plato.get("carbohidratos", 0) > 60:
            advertencias.append({
                "tipo": "diabetes",
                "nivel": "precaucion",
                "mensaje": f"Alto en carbohidratos ({plato['carbohidratos']}g). Consúmelo con moderación."
            })
        if "Hipertensión" in enfermedades and plato.get("grasas", 0) > 25:
            advertencias.append({
                "tipo": "hipertension",
                "nivel": "precaucion",
                "mensaje": "Puede ser alto en sodio. Consúmelo con moderación."
            })

    return {
        "plato_id": plato.get("id"),
        "plato_nombre": plato.get("nombre"),
        "es_seguro": len([a for a in advertencias if a["nivel"] == "peligro"]) == 0,
        "advertencias": advertencias
    }