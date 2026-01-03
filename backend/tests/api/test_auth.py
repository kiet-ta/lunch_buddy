from fastapi.testclient import TestClient
from core.config import settings
from sqlmodel import Session, select
from models.user import User

def test_signup_new_user(client: TestClient, session: Session):
    response = client.post(
        f"{settings.API_V1_STR}/auth/signup",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "first_name": "New",
            "last_name": "User",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data
    
    # Verify DB
    user = session.exec(select(User).where(User.email == "newuser@example.com")).first()
    assert user is not None

def test_signup_existing_email(client: TestClient, normal_user_token_headers):
    # normal_user_token_headers creates test@example.com
    response = client.post(
        f"{settings.API_V1_STR}/auth/signup",
        json={
            "email": "test@example.com",
            "username": "anothername",
            "first_name": "Test",
            "last_name": "User",
            "password": "password123"
        }
    )
    assert response.status_code == 400

def test_login_access_token(client: TestClient):
    # Register first
    client.post(
        f"{settings.API_V1_STR}/auth/signup",
        json={
            "email": "login@example.com",
            "username": "loginuser",
            "first_name": "Login",
            "last_name": "User",
            "password": "password123"
        }
    )
    response = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token",
        data={"username": "login@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_read_users_me(client: TestClient, normal_user_token_headers):
    response = client.get(
        f"{settings.API_V1_STR}/auth/me",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
