from pydantic import BaseModel
from typing import List

class RegistroRequest(BaseModel):
    """Schema para registro completo (auth + perfil)"""
    email: str
    password: str
    nombre: str
    fecha_nacimiento: str
    alergias: List[str]
    intolerancias: List[str]
    enfermedades: List[str]
    preferencias: List[str]
    objetivo_calorico: int

    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@ejemplo.com",
                "password": "Segura123!@#",
                "nombre": "Juan Pérez",
                "fecha_nacimiento": "1990-05-15",
                "alergias": ["gluten", "lactosa"],
                "intolerancias": [],
                "enfermedades": ["diabetes"],
                "preferencias": ["vegetariano"],
                "objetivo_calorico": 2000,
            }
        }

class RegistroResponse(BaseModel):
    """Response después de registro exitoso"""
    usuario_id: str
    email: str
    requiere_verificacion: bool = False
    mensaje: str

    class Config:
        json_schema_extra = {
            "example": {
                "usuario_id": "uuid-aqui",
                "email": "usuario@ejemplo.com",
                "requiere_verificacion": True,
                "mensaje": "Registro completado exitosamente",
            }
        }
