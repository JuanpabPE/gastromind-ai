from fastapi import APIRouter

from dataset.fooddata import resumen_fooddata, validar_detector_fooddata


router = APIRouter(prefix="/evaluacion-ia", tags=["evaluacion-ia"])


@router.get("/")
async def obtener_evaluacion_ia():
    dataset = resumen_fooddata()
    validacion = validar_detector_fooddata()

    return {
        "algoritmos_utilizados": [
            "Filtro deterministico de alergenos",
            "Ranking ponderado por reglas nutricionales",
            "LLM Groq para explicaciones y conversacion nutricional",
        ],
        "arquitectura_modelos": [
            "Perfil nutricional del usuario",
            "Menu digital y FoodData.csv",
            "Filtro de seguridad por alergenos",
            "Ranking de recomendaciones",
            "Explicacion con IA",
        ],
        "dataset_empleado": dataset,
        "tecnicas_entrenamiento": [
            "No se entrena un modelo propio",
            "Se aplica prompt engineering sobre Groq",
            "FoodData.csv funciona como base de conocimiento externa",
        ],
        "metricas_precision": {
            "precision_detector_fooddata": f"{validacion['precision']}%",
            "casos_correctos": validacion["correctos"],
            "total_casos": validacion["total_casos"],
        },
        "metricas_validacion": validacion,
        "resultados_comparativos": [
            {
                "metodo": "Solo IA",
                "resultado": "Explica mejor, pero no debe decidir seguridad critica",
            },
            {
                "metodo": "Solo reglas",
                "resultado": "Seguro para alergenos, pero menos conversacional",
            },
            {
                "metodo": "Hibrido",
                "resultado": "Combina seguridad por reglas con explicaciones de IA",
            },
        ],
        "indicadores_desempeno": {
            "fallback_reglas": "Activo",
            "top_recomendaciones": 3,
            "revision_alergenos": "Reglas + FoodData.csv",
        },
    }
