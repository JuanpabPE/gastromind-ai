from fastapi import APIRouter, Query
from typing import Optional
from . import repositorio

router = APIRouter(prefix="/menu", tags=["menu"])

@router.get("/")
async def obtener_menu(
    categoria: Optional[str] = Query(None),
    vegetariano: bool = False,
    vegano: bool = False,
    sin_gluten: bool = False,
    diabetes: bool = False,
    hipertension: bool = False,
    calorias_max: Optional[int] = Query(None),
):
    filtros = {
        "categoria": categoria,
        "vegetariano": vegetariano,
        "vegano": vegano,
        "sin_gluten": sin_gluten,
        "diabetes": diabetes,
        "hipertension": hipertension,
        "calorias_max": calorias_max,
    }
    platos = await repositorio.obtener_menu(filtros)
    return platos

@router.get("/{plato_id}")
async def obtener_plato(plato_id: str):
    plato = await repositorio.obtener_plato(plato_id)
    return plato