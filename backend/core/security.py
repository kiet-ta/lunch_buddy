from datetime import datetime, timedelta, timezone
from typing import Any, Union

from core.config import settings
from jose import jwt
from passlib.context import CryptContext
from sqlmodel import SQLModel

# Setup context for bcrypt – a strong password hashing algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    """
    Create a JWT access token.
    subject: Usually the user_id or username.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": int(expire.timestamp()), "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check whether the input password matches the hashed password stored in the database"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash the password before storing it in the database"""
    return pwd_context.hash(password)
