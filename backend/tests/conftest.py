from main import app
from db.session import get_db
from core.config import settings
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

# Ensure the project root is importable when running pytest from the repository root
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


# Import all models so SQLModel knows about them for metadata creation

# Use SQLite in-memory database for testing
# StaticPool is important for in-memory SQLite to share connection across threads/sessions
TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool
)


@pytest.fixture(name="session")
def session_fixture():
    # Create tables
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    # Drop tables after test
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_db] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="normal_user_token_headers")
def normal_user_token_headers_fixture(client: TestClient):
    """
    Creates a user, logs in, and returns the access token headers.
    """
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "first_name": "Test",
        "last_name": "User",
        "password": "testpassword123",
    }
    # Register
    client.post(f"{settings.API_V1_STR}/auth/signup", json=user_data)

    # Login (OAuth2PasswordRequestForm expects "username" field, which we map to email in our backend)
    response = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token",
        data={"username": user_data["email"], "password": user_data["password"]},
    )
    tokens = response.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers
