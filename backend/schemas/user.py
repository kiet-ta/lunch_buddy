from sqlmodel import SQLModel


class UserBase(SQLModel):
    email: str
    username: str
    first_name: str
    last_name: str
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(SQLModel):
    email: str | None = None
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    password: str | None = None
    is_active: bool | None = None


class UserPublic(UserBase):
    id: int
