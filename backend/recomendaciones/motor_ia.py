def calcular_score(plato: dict, perfil: dict) -> float:
    score = 100.0
    alergias = [a.lower() for a in perfil.get("alergias", [])]
    enfermedades = perfil.get("enfermedades", [])
    preferencias = perfil.get("preferencias", [])
    alergenos_plato = [a.lower() for a in plato.get("alergenos", [])]

    # Descarte inmediato si tiene alérgeno del usuario
    if any(a in alergenos_plato for a in alergias):
        return -1

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

    # Penalización si excede objetivo calórico
    objetivo = perfil.get("objetivo_calorico", 2000)
    calorias_plato = plato.get("calorias", 0)
    if calorias_plato > objetivo * 0.5:
        score -= 15

    return score

def recomendar_platos(platos: list, perfil: dict, top: int = 5) -> list:
    scored = []
    for plato in platos:
        score = calcular_score(plato, perfil)
        if score >= 0:
            scored.append({**plato, "score_recomendacion": round(score, 1)})

    scored.sort(key=lambda x: x["score_recomendacion"], reverse=True)
    return scored[:top]