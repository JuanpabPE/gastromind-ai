import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from autenticacion.router import router as auth_router
from perfil_nutricional.router import router as perfil_router
from menu_digital.router import router as menu_router
from alertas_alergenos.router import router as alertas_router
from recomendaciones.router import router as recomendaciones_router
from chatbot_nutricionista.router import router as chatbot_router
from historial_consumo.router import router as historial_router
from pedidos.router import router as pedidos_router
from premios.router import router as premios_router
from evaluacion_ia.router import router as evaluacion_ia_router

logger = logging.getLogger("gastromind")

app = FastAPI(title="GastroMind AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_responses(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.perf_counter()

    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000

    response.headers["X-Request-ID"] = request_id
    logger.info(
        "request_completed method=%s path=%s status=%s duration_ms=%.2f request_id=%s client=%s",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        request_id,
        request.client.host if request.client else "unknown",
    )
    return response

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"❌ VALIDATION ERROR: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
        headers={"Access-Control-Allow-Origin": "*"},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    logger.exception(
        "unhandled_exception method=%s path=%s request_id=%s",
        request.method,
        request.url.path,
        request_id,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"},
    )

app.include_router(auth_router)
app.include_router(perfil_router)
app.include_router(menu_router)
app.include_router(alertas_router)
app.include_router(recomendaciones_router)
app.include_router(chatbot_router)
app.include_router(historial_router)
app.include_router(pedidos_router)
app.include_router(premios_router)
app.include_router(evaluacion_ia_router)

@app.get("/")
def root():
    return {"mensaje": "GastroMind AI funcionando", "version": "1.0.0"}


