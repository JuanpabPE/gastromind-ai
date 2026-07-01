import json

from dataset.fooddata import buscar_alimentos_por_alergia, detectar_alergias_fooddata
from infraestructura.groq_cliente import groq_client


def normalizar_texto(valor: str) -> str:
    reemplazos = str.maketrans("áéíóúÁÉÍÓÚñÑ", "aeiouAEIOUnN")
    return str(valor or "").translate(reemplazos).lower().strip()


def coincide_alergia(alergia_detectada: str, alergias_usuario: list[str]) -> bool:
    detectada = normalizar_texto(alergia_detectada).replace(" allergy", "")
    return any(
        alergia == detectada
        or alergia in detectada
        or detectada in alergia
        for alergia in alergias_usuario
    )


def equivalentes_alergia(alergia: str) -> list[str]:
    alergia_norm = normalizar_texto(alergia)
    equivalencias = {
        "gluten": ["gluten"],
        "huevo": ["egg"],
        "huevos": ["egg"],
        "lacteos": ["milk", "lactose", "dairy"],
        "lactosa": ["milk", "lactose", "dairy"],
        "leche": ["milk", "lactose", "dairy"],
        "mani": ["peanut"],
        "cacahuate": ["peanut"],
        "frutos secos": ["nut"],
        "nueces": ["nut"],
    }
    return [alergia_norm, *equivalencias.get(alergia_norm, [])]


def detectar_riesgos_reglas_fooddata(plato: dict, perfil: dict) -> dict:
    alergenos_plato = [normalizar_texto(a) for a in (plato.get("alergenos") or [])]
    alergias_usuario = [
        normalizar_texto(a)
        for a in (perfil.get("alergias") or [])
        if normalizar_texto(a) != "ninguna"
    ]
    enfermedades = perfil.get("enfermedades", [])
    enfermedades_normalizadas = [normalizar_texto(e) for e in enfermedades]
    advertencias = []

    alergenos_encontrados = [a for a in alergias_usuario if a in alergenos_plato]
    if alergenos_encontrados:
        advertencias.append({
            "tipo": "alergeno",
            "nivel": "peligro",
            "mensaje": f"Este plato contiene: {', '.join(alergenos_encontrados)}. No es seguro para ti.",
        })

    hallazgos_fooddata = detectar_alergias_fooddata([
        plato.get("nombre", ""),
        plato.get("descripcion", ""),
        " ".join(plato.get("alergenos") or []),
    ])
    coincidencias_fooddata = [
        h
        for h in hallazgos_fooddata
        if coincide_alergia(h.get("allergy"), alergias_usuario)
    ]
    if coincidencias_fooddata:
        alimentos = ", ".join(h["food"] for h in coincidencias_fooddata)
        advertencias.append({
            "tipo": "fooddata",
            "nivel": "peligro",
            "mensaje": f"FoodData detecta posible riesgo por {alimentos}. No es seguro para tu perfil.",
        })
    else:
        alergias_declaradas = [
            alergia
            for alergia in alergias_usuario
            if alergia in alergenos_plato
        ]
        for alergia in alergias_declaradas:
            ejemplos = []
            for equivalente in equivalentes_alergia(alergia):
                ejemplos = buscar_alimentos_por_alergia(equivalente)
                if ejemplos:
                    break
            if ejemplos:
                alimentos = ", ".join(e["food"] for e in ejemplos if e.get("food"))
                advertencias.append({
                    "tipo": "fooddata",
                    "nivel": "peligro",
                    "mensaje": f"FoodData relaciona {alergia} con alimentos del dataset como {alimentos}. Refuerza que no es seguro para tu perfil.",
                })
                break

    if "diabetes" in enfermedades_normalizadas and plato.get("carbohidratos", 0) > 60:
        advertencias.append({
            "tipo": "diabetes",
            "nivel": "precaucion",
            "mensaje": f"Alto en carbohidratos ({plato['carbohidratos']}g). Consumelo con moderacion.",
        })

    if "hipertension" in enfermedades_normalizadas and plato.get("grasas", 0) > 25:
        advertencias.append({
            "tipo": "hipertension",
            "nivel": "precaucion",
            "mensaje": "Puede ser alto en sodio. Consumelo con moderacion.",
        })

    return {
        "plato_id": plato.get("id"),
        "plato_nombre": plato.get("nombre"),
        "es_seguro": not any(a["nivel"] == "peligro" for a in advertencias),
        "advertencias": advertencias,
    }


def detectar_alergenos(plato: dict, perfil: dict) -> dict:
    resultado = detectar_riesgos_reglas_fooddata(plato, perfil)
    advertencias = resultado["advertencias"]
    alergenos_plato = [normalizar_texto(a) for a in (plato.get("alergenos") or [])]
    alergias_usuario = [
        normalizar_texto(a)
        for a in (perfil.get("alergias") or [])
        if normalizar_texto(a) != "ninguna"
    ]
    enfermedades = perfil.get("enfermedades", [])

    try:
        prompt = f"""Analiza si este plato es compatible con el perfil de salud del comensal.

PLATO: {plato.get('nombre')}
Descripcion: {plato.get('descripcion', '')}
Calorias: {plato.get('calorias')} kcal
Proteinas: {plato.get('proteinas')}g
Carbohidratos: {plato.get('carbohidratos')}g
Grasas: {plato.get('grasas')}g
Alergenos declarados: {', '.join(alergenos_plato) or 'ninguno'}

PERFIL DEL COMENSAL:
Condiciones de salud: {', '.join(enfermedades) if enfermedades else 'ninguna'}
Alergias: {', '.join(alergias_usuario) if alergias_usuario else 'ninguna'}

Responde UNICAMENTE con JSON valido sin texto adicional:
{{
  "es_compatible": true o false,
  "nivel": "seguro" o "precaucion" o "peligro",
  "mensaje": "Una oracion explicando si es compatible y por que"
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
                "mensaje": data.get("mensaje", ""),
            })
    except Exception as e:
        print(f"Error en IA de alertas: {e}")

    return {
        "plato_id": plato.get("id"),
        "plato_nombre": plato.get("nombre"),
        "es_seguro": not any(a["nivel"] == "peligro" for a in advertencias),
        "advertencias": advertencias,
    }
