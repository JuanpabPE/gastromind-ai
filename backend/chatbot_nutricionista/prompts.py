SISTEMA_NUTRICIONISTA = """
Eres el nutricionista virtual de Tanta (restaurante peruano de Gastón Acurio).
Orienta al comensal sobre qué platos son mejores para su salud. Sé breve y directo.
Reglas: responde en español, nunca inventes platos, alerta sobre alérgenos, menciona calorías y precio.
"""

def construir_contexto_perfil(perfil: dict) -> str:
    if not perfil:
        return "El usuario no ha completado su perfil nutricional."

    partes = [f"Nombre: {perfil.get('nombre', 'Comensal')}"]

    if perfil.get("alergias"):
        partes.append(f"Alergias: {', '.join(perfil['alergias'])}")
    if perfil.get("enfermedades"):
        partes.append(f"Condiciones de salud: {', '.join(perfil['enfermedades'])}")
    if perfil.get("preferencias"):
        partes.append(f"Preferencias: {', '.join(perfil['preferencias'])}")
    if perfil.get("objetivo_calorico"):
        partes.append(f"Objetivo calórico diario: {perfil['objetivo_calorico']} kcal")

    return "\n".join(partes)