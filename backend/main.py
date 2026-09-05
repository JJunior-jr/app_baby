from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import activities

app = FastAPI(
    title="Roti HUB - Diário do Bebê API",
    description="Backend Python FastAPI para agendamentos e rotina diária com autenticação JWT",
    version="1.0.0"
)

# CORS configuration for mobile and web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(activities.router, prefix="/api/activities", tags=["Atividades & Agendamentos"])

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "roti-hub-fastapi",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
