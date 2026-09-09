"""
SQLAlchemy 2.0 Models para Baby John
Estrutura de dados do banco PostgreSQL
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, String, DateTime, Integer, Text, Boolean, ForeignKey, JSON, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from database import Base

class User(Base):
    """
    Modelo de usuário (Papai/Mamãe)
    """
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    baby_name = Column(String(255), default="John")
    baby_birth_date = Column(String(10), nullable=True)  # YYYY-MM-DD
    role = Column(String(50), default="admin_parent")
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relacionamentos
    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")
    custom_activities = relationship("CustomActivity", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_user_email_active", "email", "is_active"),
        UniqueConstraint("email", name="uq_user_email"),
    )

class Activity(Base):
    """
    Modelo de atividade diária do bebê
    (amamentacao, sono, fralda, comeu, custom)
    """
    __tablename__ = "activities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Informações básicas
    type = Column(String(50), nullable=False, index=True)  # 'amamentacao', 'sono', 'fralda', 'comeu', 'custom'
    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), nullable=True)

    # Timestamp e data
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    date_str = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    time_str = Column(String(5), nullable=False)  # HH:MM

    # Período do dia
    period = Column(String(20), nullable=False)  # 'Noite', 'Tarde', 'Manhã'

    # Status
    is_in_progress = Column(Boolean, default=False)
    duration_minutes = Column(Integer, nullable=True)

    # Informações adicionais
    assignee = Column(String(255), default="Papai")
    details = Column(JSON, nullable=True)  # Dados específicos por tipo (amamentacao, sono, etc)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relacionamento
    user = relationship("User", back_populates="activities")

    __table_args__ = (
        Index("idx_activity_user_date", "user_id", "date_str"),
        Index("idx_activity_user_type", "user_id", "type"),
        Index("idx_activity_timestamp", "timestamp"),
        UniqueConstraint("user_id", "id", name="uq_user_activity"),
    )

class CustomActivity(Base):
    """
    Definição de atividades personalizadas
    """
    __tablename__ = "custom_activities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(255), nullable=False)
    type = Column(String(20), nullable=False)  # 'time' ou 'instant'
    icon = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)

    is_default = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relacionamento
    user = relationship("User", back_populates="custom_activities")

    __table_args__ = (
        Index("idx_custom_activity_user", "user_id"),
        UniqueConstraint("user_id", "name", name="uq_custom_activity_name"),
    )

class AuditLog(Base):
    """
    Log de auditoria para rastreabilidade
    """
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    action = Column(String(50), nullable=False)  # 'CREATE', 'READ', 'UPDATE', 'DELETE'
    resource_type = Column(String(50), nullable=False)  # 'activity', 'user', etc
    resource_id = Column(String(36), nullable=False, index=True)

    ip_address = Column(String(45), nullable=True)  # IPv4 ou IPv6
    user_agent = Column(Text, nullable=True)

    changes = Column(JSON, nullable=True)  # O que mudou

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    __table_args__ = (
        Index("idx_audit_log_user_date", "user_id", "created_at"),
        Index("idx_audit_log_resource", "resource_type", "resource_id"),
    )

class APIKey(Base):
    """
    Chaves de API para autenticação alternativa
    """
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    key_hash = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_api_key_user", "user_id"),
    )
