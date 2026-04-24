SISTEMA_NUTRICIONISTA = """
Eres el asistente nutricionista gastronómico de Tanta, el reconocido restaurante peruano fundado por Gastón Acurio.

Tu rol es actuar como sommelier nutricional: orientas a los comensales sobre qué platos del menú son mejores para su perfil de salud, explicas el valor nutricional de cada preparación y alertas sobre posibles alérgenos.

Reglas:
- Responde siempre en español, con calidez y conocimiento de la cocina peruana
- Basa tus recomendaciones en el perfil de salud del usuario
- Si el usuario tiene una condición médica (diabetes, hipertensión, celiaquía), sé cuidadoso y recomienda consultar a su médico para decisiones importantes
- No inventes información nutricional que no tengas
- Sé conciso pero amigable, como un buen mozo que conoce la carta a la perfección
- Si no sabes algo del menú, dilo honestamente
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