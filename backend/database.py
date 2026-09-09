"""
Database configuration com SQLAlchemy 2.0
Conexão PostgreSQL com pool de conexões otimizado
"""
import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# Configuração do banco de dados
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://baby_john_user:baby_john_password@localhost:5432/baby_john_db"
)

# Engine com pool otimizado
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "False").lower() == "true",
    pool_size=20,              # Conexões ativas
    max_overflow=10,           # Conexões extras permitidas
    pool_pre_ping=True,        # Validar conexões antes de usar
    pool_recycle=3600,         # Reciclar conexões a cada 1 hora
    connect_args={
        "connect_timeout": 10,
        "options": "-c statement_timeout=30000"  # 30 segundos timeout
    }
)

# Session factory
SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False
)

# Base para models
Base = declarative_base()

def get_db() -> Session:
    """
    Dependency para injetar session do banco em rotas
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Criar todas as tabelas
    """
    Base.metadata.create_all(bind=engine)

# Event listeners para logging
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Configure SQLite to use foreign keys"""
    pass

@event.listens_for(engine, "pool_checkout")
def receive_pool_checkout(dbapi_conn, connection_record, connection_proxy):
    """Log pool checkout"""
    pass
