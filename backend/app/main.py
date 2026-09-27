import sys
import os

# Add backend directory to sys.path if missing
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if os.getcwd() not in sys.path:
    sys.path.insert(0, os.getcwd())

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="SAHAYAK API",
    description="Intelligent Campus Lost & Found Backend Platform for National Institute of Engineering (NIE), Mysuru",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard Root Endpoints
@app.get("/", tags=["Root"])
def root_index():
    return {
        "status": "online",
        "app": "SAHAYAK Intelligent Campus Lost & Found Platform",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }


@app.get("/health", tags=["Health"])
def root_health():
    return {
        "status": "healthy",
        "app": "SAHAYAK Backend",
        "environment": "production" if "VERCEL" in os.environ else "development",
        "version": "1.0.0"
    }


# Safe inclusion of API routes & database tables
try:
    from app.core.config import settings
    from app.api.v1.api import api_router
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
except Exception as e:
    import traceback
    err_trace = traceback.format_exc()
    @app.get("/api/v1/debug")
    def debug_route():
        return {"error": str(e), "traceback": err_trace, "sys_path": sys.path}

try:
    from app.db.session import engine, Base
    import app.db.models
    Base.metadata.create_all(bind=engine)
except Exception as e:
    pass

# Standard Global Error Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "data": None,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail if isinstance(exc.detail, str) else str(exc.detail)
            },
            "meta": {}
        }
    )
