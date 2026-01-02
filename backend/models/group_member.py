from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class GroupMember(SQLModel, table=True):
    group_id: int = Field(foreign_key="group.id", primary_key=True)

    user_id: int = Field(foreign_key="user.id", primary_key=True)

    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

    role: str = Field(default="member", nullable=False)
