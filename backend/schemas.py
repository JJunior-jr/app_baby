from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    email: Optional[str] = None
    babyName: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    name: str
    babyName: str = "John"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    role: str

class ActivityBase(BaseModel):
    type: str  # 'amamentacao', 'sono', 'fralda', 'comeu', 'custom'
    title: str
    subtitle: Optional[str] = None
    timestamp: str
    dateStr: str
    timeStr: str
    period: str  # 'Noite', 'Tarde', 'Manhã'
    isInProgress: Optional[bool] = False
    durationMinutes: Optional[int] = None
    assignee: Optional[str] = "Papai"
    details: Optional[Dict[str, Any]] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: str

class DailySummaryResponse(BaseModel):
    totalSleepMinutes: int
    breastfeedingSessions: int
    diaperChanges: int
