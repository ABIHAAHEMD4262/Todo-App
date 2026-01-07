"""
SQLModel Database Models - Todo App Phase III
Referencing: @specs/database/schema.md
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    """
    User model (managed by Better Auth)

    Table: users
    Indexes: email (unique)
    """
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: One user has many tasks
    tasks: list["Task"] = Relationship(
        back_populates="user",
        cascade_delete=True
    )
    conversations: list["Conversation"] = Relationship(
        back_populates="user",
        cascade_delete=True
    )

class Task(SQLModel, table=True):
    """
    Task model

    Table: tasks
    Indexes: user_id, completed, (user_id, completed) composite
    Foreign Key: user_id -> users.id (CASCADE DELETE)
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: Many tasks belong to one user
    user: User = Relationship(back_populates="tasks")

class Conversation(SQLModel, table=True):
    """
    Conversation model for chatbot sessions

    Table: conversations
    Indexes: user_id
    Foreign Key: user_id -> users.id (CASCADE DELETE)
    """
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: One conversation has many messages
    messages: list["Message"] = Relationship(
        back_populates="conversation",
        cascade_delete=True
    )
    user: User = Relationship(back_populates="conversations")

class Message(SQLModel, table=True):
    """
    Message model for conversation history

    Table: messages
    Indexes: conversation_id, role
    Foreign Key: conversation_id -> conversations.id (CASCADE DELETE)
    """
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    role: str = Field(max_length=20, index=True)  # "user" or "assistant"
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: Many messages belong to one conversation
    conversation: Conversation = Relationship(back_populates="messages")
