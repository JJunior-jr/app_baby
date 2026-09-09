"""
Router para atividades com banco de dados PostgreSQL
Substitui MOCK_ACTIVITIES com queries seguras do SQLAlchemy
Rate limiting e proteção contra SQL injection inclusos
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from slowapi.util import get_remote_address

from database import get_db
from crud import (
    create_activity, get_activities, get_activity_by_id,
    update_activity, delete_activity, get_daily_summary,
    log_audit
)
from schemas import (
    ActivityCreate, ActivityResponse, DailySummaryResponse
)
from auth import get_current_user
from models import User
from rate_limiter import limiter

router = APIRouter(prefix="/api/activities", tags=["activities"])

# ==================== CREATE ====================

@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_new_activity(
    activity: ActivityCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Criar nova atividade
    - Validação automática pelo Pydantic
    - Query parametrizada contra SQL injection
    - Auditoria de criação
    - Rate limit: 30 requisições por minuto
    """
    try:
        db_activity = create_activity(db, current_user.id, activity)

        # Log auditoria
        log_audit(
            db=db,
            user_id=current_user.id,
            action="CREATE",
            resource_type="activity",
            resource_id=db_activity.id,
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )

        return ActivityResponse.from_orm(db_activity)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ==================== READ ====================

@router.get("", response_model=List[ActivityResponse])
@limiter.limit("60/minute")
async def list_activities(
    request: Request,
    date: Optional[str] = Query(None, description="Filtro por data (YYYY-MM-DD)"),
    type: Optional[str] = Query(None, description="Filtro por tipo"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Listar atividades do usuário com filtros opcionais
    - Queries parametrizadas para todos os filtros
    - Apenas retorna atividades do usuário autenticado
    - Rate limit: 60 requisições por minuto
    """
    try:
        activities = get_activities(
            db=db,
            user_id=current_user.id,
            date_str=date,
            activity_type=type
        )
        return [ActivityResponse.from_orm(a) for a in activities]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{activity_id}", response_model=ActivityResponse)
@limiter.limit("60/minute")
async def get_activity(
    activity_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Buscar atividade específica
    - Verifica ownership antes de retornar
    - Query parametrizada
    - Rate limit: 60 requisições por minuto
    """
    try:
        activity = get_activity_by_id(db, current_user.id, activity_id)

        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atividade não encontrada"
            )

        return ActivityResponse.from_orm(activity)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ==================== UPDATE ====================

@router.put("/{activity_id}", response_model=ActivityResponse)
@limiter.limit("30/minute")
async def update_activity_endpoint(
    activity_id: str,
    activity_data: ActivityCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualizar atividade existente
    - Rate limit: 30 requisições por minuto
    """
    try:
        updated = update_activity(
            db=db,
            user_id=current_user.id,
            activity_id=activity_id,
            activity_data=activity_data.dict()
        )

        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atividade não encontrada"
            )

        # Log auditoria
        log_audit(
            db=db,
            user_id=current_user.id,
            action="UPDATE",
            resource_type="activity",
            resource_id=activity_id,
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None,
            changes=activity_data.dict()
        )

        return ActivityResponse.from_orm(updated)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ==================== DELETE ====================

@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
async def delete_activity_endpoint(
    activity_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletar atividade
    - Rate limit: 30 requisições por minuto
    """
    try:
        success = delete_activity(db, current_user.id, activity_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atividade não encontrada"
            )

        # Log auditoria
        log_audit(
            db=db,
            user_id=current_user.id,
            action="DELETE",
            resource_type="activity",
            resource_id=activity_id,
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ==================== DAILY SUMMARY ====================

@router.get("/daily-summary/{date}", response_model=DailySummaryResponse)
@limiter.limit("60/minute")
async def get_daily_summary_endpoint(
    date: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obter resumo diário de atividades
    Agregação segura com queries parametrizadas
    - Rate limit: 60 requisições por minuto
    """
    try:
        summary = get_daily_summary(db, current_user.id, date)
        return DailySummaryResponse(**summary)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
