from sqlmodel import SQLModel


# token give back to client
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# payload inside the token
class TokenPayload(SQLModel):
    sub: str | None = None
