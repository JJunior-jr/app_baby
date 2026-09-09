"""
FastAPI Application - Baby John
Backend com PostgreSQL + SQLAlchemy 2.0
Inclui rate limiting e proteção contra SQL injection
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
from dotenv import load_dotenv

from routers import activities, auth
from database import init_db
from config import settings
from middleware import rate_limit_error_handler
from rate_limiter import limiter

# Load environment variables
load_dotenv()

# Logging configuration
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    description="Backend Python FastAPI para agendamentos e rotina diária com autenticação JWT",
    version=settings.API_VERSION,
    debug=settings.DEBUG
)

# Rate limiter configuration
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_error_handler)

# State management
@app.on_event("startup")
async def startup_event():
    """Inicializar banco de dados na startup"""
    try:
        init_db()
        logger.info("✓ Banco de dados inicializado")
    except Exception as e:
        logger.error(f"✗ Erro ao inicializar banco: {e}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# Error handling middleware
@app.middleware("http")
async def error_handler_middleware(request: Request, call_next):
    """Global error handler"""
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Unhandled error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

# Routers
app.include_router(auth.router)
app.include_router(activities.router)

# Health check endpoint
@app.get("/api/health")
@limiter.limit("10/minute")
async def health_check(request: Request):
    """Health check endpoint com rate limiting"""
    return {
        "status": "healthy",
        "service": "baby-john-fastapi",
        "version": settings.API_VERSION,
        "database": "postgresql"
    }

# Root endpoint
@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    """Root endpoint da API"""
    return {
        "message": "Baby John API",
        "docs": "/docs",
        "openapi": "/openapi.json",
        "version": settings.API_VERSION
    }

# Startup info
@app.on_event("startup")
async def log_startup():
    """Log startup info"""
    logger.info("="*60)
    logger.info(f"  {settings.API_TITLE}")
    logger.info(f"  Version {settings.API_VERSION}")
    logger.info("="*60)
    logger.info(f"Database: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'configured'}")
    logger.info(f"Rate limiting: {'Enabled' if settings.RATE_LIMIT_ENABLED else 'Disabled'}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info("="*60)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
