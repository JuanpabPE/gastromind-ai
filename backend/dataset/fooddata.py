import csv
from functools import lru_cache
from pathlib import Path


DATASET_PATH = Path(__file__).resolve().parent / "FoodData.csv"


def normalizar_texto(valor: str) -> str:
    reemplazos = str.maketrans("áéíóúÁÉÍÓÚñÑ", "aeiouAEIOUnN")
    return str(valor or "").translate(reemplazos).lower().strip()


@lru_cache(maxsize=1)
def cargar_fooddata() -> list[dict]:
    with DATASET_PATH.open("r", encoding="utf-8-sig", newline="") as archivo:
        return list(csv.DictReader(archivo))


def resumen_fooddata() -> dict:
    filas = cargar_fooddata()
    clases = sorted({fila["Class"] for fila in filas if fila.get("Class")})
    tipos = sorted({fila["Type"] for fila in filas if fila.get("Type")})
    alergias = sorted({fila["Allergy"] for fila in filas if fila.get("Allergy")})
    return {
        "nombre": "FoodData.csv",
        "filas": len(filas),
        "columnas": ["Class", "Type", "Group", "Food", "Allergy"],
        "clases": clases,
        "total_tipos": len(tipos),
        "total_alergias": len(alergias),
        "ejemplos": filas[:5],
    }


def detectar_alergias_fooddata(textos: list[str]) -> list[dict]:
    texto_completo = " ".join(normalizar_texto(t) for t in textos if t)
    hallazgos = []

    for fila in cargar_fooddata():
        alimento = fila.get("Food", "")
        alimento_norm = normalizar_texto(alimento)
        if not alimento_norm:
            continue
        if alimento_norm in texto_completo:
            hallazgos.append({
                "food": alimento,
                "allergy": fila.get("Allergy"),
                "type": fila.get("Type"),
                "group": fila.get("Group"),
            })

    vistos = set()
    unicos = []
    for hallazgo in hallazgos:
        clave = (hallazgo["food"], hallazgo["allergy"])
        if clave in vistos:
            continue
        vistos.add(clave)
        unicos.append(hallazgo)
    return unicos


def buscar_alimentos_por_alergia(alergia: str, limite: int = 4) -> list[dict]:
    alergia_norm = normalizar_texto(alergia).replace(" allergy", "")
    hallazgos = []

    for fila in cargar_fooddata():
        allergy_norm = normalizar_texto(fila.get("Allergy", "")).replace(" allergy", "")
        if (
            alergia_norm
            and (
                alergia_norm == allergy_norm
                or alergia_norm in allergy_norm
                or allergy_norm in alergia_norm
            )
        ):
            hallazgos.append({
                "food": fila.get("Food"),
                "allergy": fila.get("Allergy"),
                "type": fila.get("Type"),
                "group": fila.get("Group"),
            })
        if len(hallazgos) >= limite:
            break

    return hallazgos


def validar_detector_fooddata() -> dict:
    filas = cargar_fooddata()
    total = len(filas)
    correctos = 0
    casos = []

    for fila in filas:
        hallazgos = detectar_alergias_fooddata([fila["Food"]])
        esperado = fila.get("Allergy")
        predicho = hallazgos[0]["allergy"] if hallazgos else None
        ok = predicho == esperado
        if ok:
            correctos += 1
        if len(casos) < 8:
            casos.append({
                "alimento": fila.get("Food"),
                "esperado": esperado,
                "predicho": predicho,
                "correcto": ok,
            })

    precision = round((correctos / total) * 100, 2) if total else 0
    return {
        "total_casos": total,
        "correctos": correctos,
        "precision": precision,
        "casos_muestra": casos,
    }
