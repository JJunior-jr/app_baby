import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from schemas import ActivityCreate, ActivityResponse, DailySummaryResponse, UserResponse
from auth import get_current_user

router = APIRouter()

# In-memory mock database for fast execution (easily replaced with PostgreSQL / SQLite)
MOCK_ACTIVITIES = [
    {
        "id": "act-1",
        "type": "custom",
        "title": "Tommy time botao estantaneo",
        "timestamp": "2026-08-19T23:05:00",
        "dateStr": "2026-08-19",
        "timeStr": "23:05",
        "period": "Noite",
        "assignee": "Papai",
    },
    {
        "id": "act-2",
        "type": "custom",
        "title": "Tammy time",
        "subtitle": "tammy time",
        "timestamp": "2026-08-19T23:05:00",
        "dateStr": "2026-08-19",
        "timeStr": "23:05",
        "period": "Noite",
        "isInProgress": True,
        "assignee": "Papai",
    },
    {
        "id": "act-4",
        "type": "comeu",
        "title": "Refeição",
        "subtitle": "Comeu",
        "timestamp": "2026-08-19T23:05:00",
        "dateStr": "2026-08-19",
        "timeStr": "23:05",
        "period": "Noite",
        "assignee": "Papai",
    },
    {
        "id": "act-5",
        "type": "fralda",
        "title": "Fralda (Xixi + Cocô)",
        "timestamp": "2026-08-19T23:05:00",
        "dateStr": "2026-08-19",
        "timeStr": "23:05",
        "period": "Noite",
        "assignee": "Papai",
    }
]

@router.get("", response_model=List[ActivityResponse])
def get_activities(
    date: Optional[str] = Query(None, description="Data no formato YYYY-MM-DD"),
    filter_type: Optional[str] = Query(None, description="Tipo de atividade (amamentacao, sono, fralda, comeu)"),
    current_user: UserResponse = Depends(get_current_user)
):
    """Lista atividades do bebê com proteção JWT"""
    results = MOCK_ACTIVITIES
    if date:
        results = [a for a in results if a.get("dateStr") == date]
    if filter_type and filter_type != "all":
        results = [a for a in results if a.get("type") == filter_type]
    return results

@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity: ActivityCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Registra uma nova atividade na rotina diária"""
    new_id = f"act-{uuid.uuid4().hex[:8]}"
    activity_dict = activity.model_dump()
    activity_dict["id"] = new_id
    MOCK_ACTIVITIES.insert(0, activity_dict)
    return activity_dict

@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Exclui uma atividade pelo ID"""
    global MOCK_ACTIVITIES
    MOCK_ACTIVITIES = [a for a in MOCK_ACTIVITIES if a["id"] != activity_id]
    return None

@router.get("/summary/daily", response_model=DailySummaryResponse)
def get_daily_summary(
    date: str = Query(..., description="Data no formato YYYY-MM-DD"),
    current_user: UserResponse = Depends(get_current_user)
):
    """Retorna métricas de sono, amamentação e fraldas para o dia selecionado"""
    if date == "2026-08-19":
        return DailySummaryResponse(
            totalSleepMinutes=336, # 5h 36min
            breastfeedingSessions=3,
            diaperChanges=4
        )
    return DailySummaryResponse(
        totalSleepMinutes=0,
        breastfeedingSessions=0,
        diaperChanges=0
    )
