"""
Script para migrar dados do mock anterior para o banco PostgreSQL
Execute apenas uma vez após criar as tabelas
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Activity
from security import get_password_hash
from crud import log_audit

# Dados mockados anteriores (substitua com seus dados reais)
MOCK_ACTIVITIES = [
    {
        "id": "activity-001",
        "type": "amamentacao",
        "title": "Amamentação",
        "subtitle": "Lado direito",
        "timestamp": "2026-09-09T08:30:00",
        "dateStr": "2026-09-09",
        "timeStr": "08:30",
        "period": "Manhã",
        "isInProgress": False,
        "durationMinutes": 15,
        "assignee": "Mamãe",
        "details": {"side": "right"}
    },
    {
        "id": "activity-002",
        "type": "sono",
        "title": "Sono",
        "subtitle": "Sono tranquilo",
        "timestamp": "2026-09-09T09:30:00",
        "dateStr": "2026-09-09",
        "timeStr": "09:30",
        "period": "Manhã",
        "isInProgress": False,
        "durationMinutes": 45,
        "assignee": "Mamãe",
        "details": {}
    },
]

def migrate_mock_data():
    """
    Migrar dados do mock anterior
    """
    print("\n" + "="*60)
    print("MIGRAÇÃO DE DADOS DO MOCK")
    print("="*60 + "\n")

    db = SessionLocal()
    try:
        # Verificar se já existe usuário padrão
        user = db.query(User).filter_by(email="test@babyjohn.com").first()
        if not user:
            print("✗ Usuário padrão não encontrado")
            print("  Execute init_db.py primeiro")
            return False

        # Contar atividades existentes
        existing_count = db.query(Activity).filter_by(user_id=user.id).count()
        if existing_count > 0:
            print(f"✓ {existing_count} atividades já existem")
            response = input("Deseja continuar e adicionar mais? (s/n): ")
            if response.lower() != 's':
                return False

        # Migrar atividades
        migrated = 0
        for activity_data in MOCK_ACTIVITIES:
            try:
                activity = Activity(
                    user_id=user.id,
                    type=activity_data["type"],
                    title=activity_data["title"],
                    subtitle=activity_data.get("subtitle"),
                    timestamp=datetime.fromisoformat(activity_data["timestamp"]),
                    date_str=activity_data["dateStr"],
                    time_str=activity_data["timeStr"],
                    period=activity_data["period"],
                    is_in_progress=activity_data.get("isInProgress", False),
                    duration_minutes=activity_data.get("durationMinutes"),
                    assignee=activity_data.get("assignee", "Papai"),
                    details=activity_data.get("details", {})
                )
                db.add(activity)
                db.flush()

                # Log auditoria
                log_audit(
                    db=db,
                    user_id=user.id,
                    action="IMPORT",
                    resource_type="activity",
                    resource_id=activity.id,
                    changes={"source": "mock_migration"}
                )

                migrated += 1
                print(f"  ✓ Migrada: {activity.title} ({activity.time_str})")

            except Exception as e:
                print(f"  ✗ Erro ao migrar {activity_data['title']}: {e}")
                db.rollback()
                continue

        db.commit()
        print(f"\n✓ {migrated} atividades migradas com sucesso")
        return True

    except Exception as e:
        print(f"✗ Erro na migração: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    success = migrate_mock_data()
    sys.exit(0 if success else 1)
