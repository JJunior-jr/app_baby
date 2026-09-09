"""
Router de autenticação
Login, registro e gerenciamento de tokens
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from schemas import UserCreate, UserResponse, Token
from auth import create_access_token, get_password_hash, verify_password, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from database import get_db
from models import User

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registrar novo usuário
    - Email único
    - Password hasheado com bcrypt
    - Query parametrizada contra SQL injection
    """
    # Verificar se email já existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )

    # Criar novo usuário
    try:
        new_user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=get_password_hash(user_data.password),
            baby_name=user_data.babyName
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return UserResponse(
            id=new_user.id,
            email=new_user.email,
            name=new_user.name,
            babyName=new_user.baby_name,
            role=new_user.role
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar usuário"
        )

@router.post("/login", response_model=Token)
async def login(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    """
    Fazer login e retornar JWT token
    """
    # Buscar usuário com query parametrizada
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )

    # Criar token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "name": user.name,
            "babyName": user.baby_name,
            "role": user.role
        },
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Obter informações do usuário autenticado
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        babyName=current_user.baby_name,
        role=current_user.role
    )

@router.put("/me", response_model=UserResponse)
async def update_me(
    name: str = None,
    baby_name: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualizar dados do usuário
    """
    try:
        if name:
            current_user.name = name
        if baby_name:
            current_user.baby_name = baby_name

        db.commit()
        db.refresh(current_user)

        return UserResponse(
            id=current_user.id,
            email=current_user.email,
            name=current_user.name,
            babyName=current_user.baby_name,
            role=current_user.role
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar usuário"
        )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout (operação client-side, apenas confirmação)
    """
    return {"message": "Logout realizado com sucesso"}
