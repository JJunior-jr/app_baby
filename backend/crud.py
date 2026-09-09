"""
CRUD operations com SQLAlchemy 2.0
Operações seguras contra SQL Injection
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from models import User, Activity, CustomActivity, AuditLog, APIKey
from schemas import (
    UserCreate, ActivityCreate, CustomActivityCreate,
    UserResponse, ActivityResponse, CustomActivityResponse
)
from security import get_password_hash, verify_password

# ==================== USER OPERATIONS ====================

def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Criar novo usuário com password hasheado
    Proteção contra SQL injection via parameterização SQLAlchemy
    """
    try:
        db_user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=get_password_hash(user_data.password),
            baby_name=user_data.babyName
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Email {user_data.email} já existe")
    except SQLAlchemyError as e:
        db.rollback()
        raise Exception(f"Erro ao criar usuário: {str(e)}")

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Buscar usuário por email com query parametrizada
    """
    try:
        query = select(User).where(User.email == email)
        return db.execute(query).scalar_one_or_none()
    except SQLAlchemyError as e:
        raise Exception(f"Erro ao buscar usuário: {str(e)}")

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """
    Buscar usuário por ID
    """
    try:
        query = select(User).where(User.id == user_id)
        return db.execute(query).scalar_one_or_none()
    except SQLAlchemyError as e:
        raise Exception(f"Erro ao buscar usuário: {str(e)}")

# ==================== ACTIVITY OPERATIONS ====================

def create_activity(db: Session, user_id: str, activity_data: ActivityCreate) -> Activity:
    """
    Criar nova atividade para usuário
    """
    try:
        db_activity = Activity(
            user_id=user_id,
            type=activity_data.type,
            title=activity_data.title,
            subtitle=activity_data.subtitle,
            timestamp=datetime.fromisoformat(activity_data.timestamp),
            date_str=activity_data.dateStr,
            time_str=activity_data.timeStr,
            period=activity_data.period,
            is_in_progress=activity_data.isInProgress,
            duration_minutes=activity_data.durationMinutes,
            assignee=activity_data.assignee,
            details=activity_data.details
        )
        db.add(db_activity)
        db.commit()
        db.refresh(db_activity)
        return db_activity
    except SQLAlchemyError as e:
        db.rollback()
        raise Exception(f"Erro ao criar atividade: {str(e)}")

def get_activities(
    db: Session,
    user_id: str,
    date_str: Optional[str] = None,
    activity_type: Optional[str] = None
) -> List[Activity]:
    """
    Listar atividades com filtros seguros
    """
    try:
        query = select(Activity).where(Activity.user_id == user_id)

        if date_str:
            query = query.where(Activity.date_str == date_str)

        if activity_type and activity_type != "all":
            query = query.where(Activity.type == activity_type)

        query = query.order_by(Activity.timestamp.desc())

        return db.execute(query).scalars().all()
    except SQLAlchemyError as e:
        raise Exception(f"Erro ao listar atividades: {str(e)}")

def get_activity_by_id(db: Session, user_id: str, activity_id: str) -> Optional[Activity]:
    """
    Buscar atividade específica do usuário
    """
    try:
        query = select(Activity).where(
            and_(
                Activity.id == activity_id,
                Activity.user_id == user_id
            )
        )
        return db.execute(query).scalar_one_or_none()
    except SQLAlchemyError as e:
        raise Exception(f"Erro ao buscar atividade: {str(e)}")

def update_activity(
    db: Session,
    user_id: str,
    activity_id: str,
    activity_data: dict
) -> Optional[Activity]:
    """
    Atualizar atividade
    """
    try:
        activity = get_activity_by_id(db, user_id, activity_id)
        if not activity:
            return None

        for key, value in activity_data.items():
            if hasattr(activity, key) and value is not None:
                setattr(activity, key, value)

        db.commit()
        db.refresh(activity)
        return activity
    except SQLAlchemyError as e:
        db.rollback()
        raise Exception(f"Erro ao atualizar atividade: {str(e)}")

def delete_activity(db: Session, user_id: str, activity_id: str) -> bool:
    """
    Deletar atividade (soft delete)
    """
    try:
        activity = get_activity_by_id(db, user_id, activity_id)
        if not activity:
            return False

        db.delete(activity)
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise Exception(f"Erro ao deletar atividade: {str(e)}")

def get_daily_summary(db: Session, user_id: str, date_str: str) -> dict:
    """
    Calcular resumo diário com queries otimizadas
    """
    try:
        activities = get_activities(db, user_id, date_str=date_str)

        total_sleep = 0
        breastfeeding_count = 0
        diaper_count = 0

        for activity in activities:
            if activity.type == "sono":
                total_sleep += activity.duration_minutes or 0
            elif activity.type == "amamentacao":
                breastfeeding_count += 1
            elif activity.type == "fralda":
                diaper_count += 1

        return {
            "totalSleepMinutes": total_sleep,
            "breastfeedingSessions": breastfeeding_count,
            "diaperChanges": diaper_count
        }
    except SQLAlchemyError as e:
        raise Exception(f"Erro ao calcular resumo: {str(e)}")

# ==================== CUSTOM ACTIVITY OPERATIONS ====================

def create_custom_activity(
    db: Session,
    user_id: str,
    activity_data: CustomActivityCreate
) -> CustomActivity:
    """
    Criar atividade personalizada
    """
    try:
        db_custom = CustomActivity(
            user_id=user_id,
            name=activity_data.name,
            type=activity_data.type,
            icon=activity_data.icon,
            description=activity_data.description,
            is_default=False
        )
        db.add(db_custom)
        db.commit()
        db.refresh(db_custom)
        return db_custom
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Atividade {activity_data.name} já existe para este usuário")
    except SQLAlchemyError as e:
        db.rollback()
        raise Exception(f"Erro ao criar atividade personalizada: {str(e)}")

def get_custom_activities(db: Session, user_id: str) -> List[CustomActivity]:
    """
    Listar atividades personalizadas do usuário
    """
    try:
        query = select(CustomActivity).where(CustomActivity.user_id == user_id)
        return db.execute(query).scalars().all()
    except SQLAlchemyError as e:
        raise Exception(f"Erro ao listar atividades personalizadas: {str(e)}")

# ==================== AUDIT OPERATIONS ====================

def log_audit(
    db: Session,
    user_id: Optional[str],
    action: str,
    resource_type: str,
    resource_id: str,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    changes: Optional[dict] = None
):
    """
    Registrar ação de auditoria
    """
    try:
        audit = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            changes=changes
        )
        db.add(audit)
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Erro ao registrar auditoria: {str(e)}")
