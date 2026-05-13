from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from perfil_nutricional.router import router as perfil_router
from menu_digital.router import router as menu_router
from alertas_alergenos.router import router as alertas_router
from recomendaciones.router import router as recomendaciones_router
from chatbot_nutricionista.router import router as chatbot_router
from historial_consumo.router import router as historial_router
from pedidos.router import router as pedidos_router

app = FastAPI(title="GastroMind AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
        headers={"Access-Control-Allow-Origin": "*"},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"},
    )

app.include_router(perfil_router)
app.include_router(menu_router)
app.include_router(alertas_router)
app.include_router(recomendaciones_router)
app.include_router(chatbot_router)
app.include_router(historial_router)
app.include_router(pedidos_router)

@app.get("/")
def root():
    return {"mensaje": "GastroMind AI funcionando", "version": "1.0.0"}