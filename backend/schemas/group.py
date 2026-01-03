from typing import Optional

from sqlmodel import SQLModel


class GroupBase(SQLModel):
    name: str
    description: Optional[str] = None


class GroupCreate(GroupBase):
    pass


class GroupUpdate(GroupBase):
    name: Optional[str] = None
    description: Optional[str] = None


class GroupRead(GroupBase):
    id: int