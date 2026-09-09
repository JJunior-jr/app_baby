"""
Inicialização do banco de dados PostgreSQL
Script para criar tabelas e dados iniciais
"""
import os
import sys
from sqlalchemy import inspect
from database import engine, Base, SessionLocal, init_db
from models import User, Activity, CustomActivity, AuditLog, APIKey
from security import get_password_hash

def init_database():
    """
    Criar todas as tabelas do banco
    """
    print("Criando tabelas do banco de dados...")
    try:
        init_db()
        print("✓ Tabelas criadas com sucesso")
    except Exception as e:
        print(f"✗ Erro ao criar tabelas: {e}")
        return False
    return True

def seed_initial_data():
    """
    Inserir dados iniciais (usuário de teste, atividades padrão)
    """
    db = SessionLocal()
    try:
        # Verificar se já existe usuário
        existing_user = db.query(User).filter_by(email="test@babyjohn.com").first()
        if existing_user:
            print("✓ Usuário de teste já existe")
            return

        # Criar usuário de teste
        test_user = User(
            email="test@babyjohn.com",
            name="Test Parent",
            password_hash=get_password_hash("password123"),
            baby_name="Little John",
            role="admin_parent"
        )
        db.add(test_user)
        db.commit()

        print("✓ Usuário de teste criado")
        print(f"  Email: test@babyjohn.com")
        print(f"  Password: password123")

    except Exception as e:
        print(f"✗ Erro ao criar dados iniciais: {e}")
        db.rollback()
    finally:
        db.close()

def check_database_connection():
    """
    Verificar conexão com banco de dados
    """
    try:
        with engine.connect() as connection:
            print("✓ Conexão com PostgreSQL estabelecida")
            return True
    except Exception as e:
        print(f"✗ Erro ao conectar ao PostgreSQL: {e}")
        print("\nCertifique-se de que:")
        print("  1. PostgreSQL está rodando")
        print("  2. Variável DATABASE_URL está correta")
        print("  3. Banco de dados existe")
        return False

def main():
    """
    Executar inicialização completa
    """
    print("\n" + "="*50)
    print("INICIALIZAÇÃO BABY JOHN DATABASE")
    print("="*50 + "\n")

    # 1. Verificar conexão
    if not check_database_connection():
        return False

    # 2. Criar tabelas
    if not init_database():
        return False

    # 3. Seed inicial
    seed_initial_data()

    print("\n" + "="*50)
    print("✓ Banco de dados pronto!")
    print("="*50 + "\n")

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
