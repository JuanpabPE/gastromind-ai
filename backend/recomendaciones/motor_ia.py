def calcular_score(plato: dict, perfil: dict, historial_ids: list = []) -> float:
    score = 100.0
    alergias = [a.lower() for a in perfil.get("alergias", [])]
    enfermedades = perfil.get("enfermedades", [])
    preferencias = perfil.get("preferencias", [])
    alergenos_plato = [a.lower() for a in plato.get("alergenos", [])]

    # Descarte inmediato si tiene alérgeno del usuario
    if any(a in alergenos_plato for a in alergias):
        return -1

    # Penalización si el plato fue consumido recientemente
    if plato.get("id") in historial_ids:
        score -= 40

    # Bonificaciones por preferencias
    if "Vegano" in preferencias and plato.get("apto_vegano"):
        score += 30
    if "Vegetariano" in preferencias and plato.get("apto_vegetariano"):
        score += 20
    if "Sin gluten" in preferencias and plato.get("apto_sin_gluten"):
        score += 20

    # Bonificaciones por enfermedades
    if "Diabetes" in enfermedades:
        if plato.get("apto_diabetes"):
            score += 25
        elif plato.get("carbohidratos", 0) > 60:
            score -= 30

    if "Hipertensión" in enfermedades:
        if plato.get("apto_hipertension"):
            score += 25
        elif plato.get("grasas", 0) > 25:
            score -= 20

    if "Celiaquía" in enfermedades and plato.get("apto_sin_gluten"):
        score += 30

    # Penalización si excede objetivo calórico
    objetivo = perfil.get("objetivo_calorico", 2000)
    if plato.get("calorias", 0) > objetivo * 0.5:
        score -= 15

    return score

def recomendar_platos(platos: list, perfil: dict, historial_ids: list = [], top: int = 5) -> list:
    scored = []
    for plato in platos:
        score = calcular_score(plato, perfil, historial_ids)
        if score >= 0:
            # Genera explicación nutricional
            explicacion = generar_explicacion(plato, perfil)
            scored.append({
                **plato,
                "score_recomendacion": round(score, 1),
                "explicacion": explicacion
            })

    scored.sort(key=lambda x: x["score_recomendacion"], reverse=True)
    return scored[:top]

def generar_explicacion(plato: dict, perfil: dict) -> str:
    partes = []
    enfermedades = perfil.get("enfermedades", [])
    preferencias = perfil.get("preferencias", [])

    if "Diabetes" in enfermedades and plato.get("apto_diabetes"):
        partes.append("apto para diabéticos")
    if "Hipertensión" in enfermedades and plato.get("apto_hipertension"):
        partes.append("bajo en sodio")
    if "Vegano" in preferencias and plato.get("apto_vegano"):
        partes.append("100% vegano")
    if "Vegetariano" in preferencias and plato.get("apto_vegetariano"):
        partes.append("vegetariano")
    if plato.get("apto_sin_gluten"):
        partes.append("sin gluten")
    if plato.get("calorias", 0) < 350:
        partes.append("bajo en calorías")
    if plato.get("proteinas", 0) > 25:
        partes.append("alto en proteínas")

    if partes:
        return f"Este plato es {', '.join(partes)}. Contiene {plato.get('calorias')} kcal, {plato.get('proteinas')}g de proteínas y {plato.get('carbohidratos')}g de carbohidratos."
    return f"Contiene {plato.get('calorias')} kcal, {plato.get('proteinas')}g de proteínas y {plato.get('carbohidratos')}g de carbohidratos."