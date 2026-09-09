"""
Validação de schema e estrutura do banco de dados
"""
from sqlalchemy import inspect
from database import engine
from models import Base, User, Activity, CustomActivity, AuditLog, APIKey

def check_database_schema():
    """
    Validar que todas as tabelas e índices foram criados
    """
    print("\n" + "="*60)
    print("  VALIDAÇÃO DE SCHEMA DO BANCO DE DADOS")
    print("="*60 + "\n")

    inspector = inspect(engine)
    tables = inspector.get_table_names()

    required_tables = ["users", "activities", "custom_activities", "audit_logs", "api_keys"]
    expected_columns = {
        "users": ["id", "email", "name", "password_hash", "baby_name", "role", "is_active"],
        "activities": ["id", "user_id", "type", "title", "timestamp", "date_str", "period"],
        "custom_activities": ["id", "user_id", "name", "type", "is_default"],
        "audit_logs": ["id", "user_id", "action", "resource_type", "resource_id"],
        "api_keys": ["id", "user_id", "key_hash", "name", "is_active"]
    }

    print("✓ Tabelas encontradas:")
    all_present = True
    for table in required_tables:
        if table in tables:
            print(f"  ✓ {table}")
        else:
            print(f"  ✗ FALTANDO: {table}")
            all_present = False

    if not all_present:
        print("\n✗ Algumas tabelas estão faltando!")
        return False

    print("\n✓ Validando colunas:")
    for table, columns in expected_columns.items():
        table_columns = [col["name"] for col in inspector.get_columns(table)]
        missing = [col for col in columns if col not in table_columns]

        if missing:
            print(f"  ✗ {table}: faltando {missing}")
            all_present = False
        else:
            print(f"  ✓ {table}: todas as colunas presentes")

    print("\n✓ Validando índices:")
    for table in required_tables:
        indexes = inspector.get_indexes(table)
        if indexes:
            for idx in indexes:
                print(f"  ✓ {table}.{idx['name']}: {idx['column_names']}")
        else:
            print(f"  - {table}: sem índices customizados")

    print("\n✓ Validando constraints:")
    for table in required_tables:
        fks = inspector.get_foreign_keys(table)
        for fk in fks:
            print(f"  ✓ {table}.{fk['constrained_columns']} → {fk['referred_table']}.{fk['referred_columns']}")

    print("\n" + "="*60)
    if all_present:
        print("✓ Schema válido!")
        return True
    else:
        print("✗ Schema incompleto!")
        return False

if __name__ == "__main__":
    check_database_schema()
