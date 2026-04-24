from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class PerfilInput(BaseModel):
    nombre: str
    fecha_nacimiento: Optional[date] = None
    alergias: List[str] = []
    intolerancias: List[str] = []
    enfermedades: List[str] = []
    preferencias: List[str] = []
    objetivo_calorico: int = 2000

class PerfilOutput(BaseModel):
    id: str
    usuario_id: str
    nombre: str
    alergias: List[str]
    intolerancias: List[str]
    enfermedades: List[str]
    preferencias: List[str]
    objetivo_calorico: int