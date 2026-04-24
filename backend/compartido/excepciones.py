from fastapi import HTTPException

def error_no_encontrado(recurso: str):
    raise HTTPException(status_code=404, detail=f"{recurso} no encontrado")

def error_no_autorizado():
    raise HTTPException(status_code=401, detail="No autorizado")

def error_servidor():
    raise HTTPException(status_code=500, detail="Error interno del servidor")