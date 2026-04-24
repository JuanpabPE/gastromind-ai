def detectar_alergenos(plato: dict, perfil: dict) -> dict:
    alergenos_plato = [a.lower() for a in plato.get("alergenos", [])]
    alergias_usuario = [a.lower() for a in perfil.get("alergias", [])]
    enfermedades = perfil.get("enfermedades", [])

    alergenos_encontrados = [
        a for a in alergias_usuario
        if a in alergenos_plato
    ]

    advertencias = []

    if alergenos_encontrados:
        advertencias.append({
            "tipo": "alergeno",
            "nivel": "peligro",
            "mensaje": f"Este plato contiene: {', '.join(alergenos_encontrados)}"
        })

    if "Diabetes" in enfermedades and plato.get("carbohidratos", 0) > 60:
        advertencias.append({
            "tipo": "diabetes",
            "nivel": "precaucion",
            "mensaje": f"Alto en carbohidratos ({plato['carbohidratos']}g). Consulta tu plan alimentario."
        })

    if "Hipertensión" in enfermedades and plato.get("grasas", 0) > 25:
        advertencias.append({
            "tipo": "hipertension",
            "nivel": "precaucion",
            "mensaje": "Este plato puede ser alto en sodio. Consúmelo con moderación."
        })

    return {
        "plato_id": plato.get("id"),
        "plato_nombre": plato.get("nombre"),
        "es_seguro": len(alergenos_encontrados) == 0,
        "advertencias": advertencias
    }