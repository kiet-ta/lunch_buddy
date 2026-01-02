from datetime import timedelta
from typing import Annotated, Any

from api.deps import CurrentUser, SessionDep
from core import security
from core.config import settings
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from models.user import User
from schemas.token import Token
from schemas.user import UserCreate, UserPublic
from sqlmodel import select

router = APIRouter()


@router.post("/login/access-token", response_model=Token)
def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """
    OAuth2 compatible token login, returns an access token for future requests.
    """
    # 1. Find user by email (OAuth2 uses "username" field by default,
    # here we allow login using email)
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()

    # 2. Verify password
    if not user or not security.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # 3. Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create a new user without requiring authentication.
    """
    # Check for duplicate email
    user = session.exec(select(User).where(User.email == user_in.email)).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )

    # Create a new user
    try:
        user = User.model_validate(
            user_in,
            update={"hashed_password": security.get_password_hash(user_in.password)},
        )
        session.add(user)
        session.commit()
        session.refresh(user)
    except Exception:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    return user


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Retrieve the current authenticated user.
    """
    return current_user
