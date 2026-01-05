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


class JoinGroupRequest(SQLModel):
    token: str


class GroupInviteResponse(SQLModel):
    invite_url: str
    qr_code_data: str
    expires_at: str