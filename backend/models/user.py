from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: Optional[str] = Field(default=None, index=True, nullable=True, unique=True)
    username: str = Field(index=True, nullable=False, unique=True)
    first_name: str = Field(nullable=False)
    last_name: str = Field(nullable=False)
    hashed_password: Optional[str] = Field(default=None, nullable=True, exclude=True)
    is_active: bool = Field(default=True, nullable=False)
    is_guest: bool = Field(default=True, nullable=False)
