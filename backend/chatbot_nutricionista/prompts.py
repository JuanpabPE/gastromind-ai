SISTEMA_NUTRICIONISTA = """
Eres el nutricionista de Tanta. Responde en máximo 2-3 oraciones cortas.
Da UNA recomendación concreta: nombre del plato, precio y calorías. Nada más.
No uses emojis. No hagas introducciones largas.
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