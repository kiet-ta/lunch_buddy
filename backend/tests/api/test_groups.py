from fastapi.testclient import TestClient
from core.config import settings

def test_create_group(client: TestClient, normal_user_token_headers):
    response = client.post(
        f"{settings.API_V1_STR}/groups/",
        headers=normal_user_token_headers,
        json={"name": "Lunch Group", "description": "Awesome lunch"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Lunch Group"
    assert data["id"] is not None

def test_read_my_groups(client: TestClient, normal_user_token_headers):
    # Create a group first
    client.post(
        f"{settings.API_V1_STR}/groups/",
        headers=normal_user_token_headers,
        json={"name": "My Group"}
    )
    response = client.get(
        f"{settings.API_V1_STR}/groups/",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(g["name"] == "My Group" for g in data)

def test_join_group(client: TestClient, normal_user_token_headers):
    # 1. Create a second user (inviter)
    inviter_data = {
        "email": "inviter@example.com",
        "username": "inviter",
        "first_name": "Inviter",
        "last_name": "User",
        "password": "password123"
    }
    client.post(f"{settings.API_V1_STR}/auth/signup", json=inviter_data)
    
    # 2. Login as inviter
    resp = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token",
        data={"username": inviter_data["email"], "password": inviter_data["password"]}
    )
    inviter_token = resp.json()["access_token"]
    inviter_headers = {"Authorization": f"Bearer {inviter_token}"}

    # 3. Inviter creates a group
    group_resp = client.post(
        f"{settings.API_V1_STR}/groups/",
        headers=inviter_headers,
        json={"name": "Joinable Group"}
    )
    group_id = group_resp.json()["id"]

    # 4. Normal user joins the group
    join_resp = client.post(
        f"{settings.API_V1_STR}/groups/{group_id}/join",
        headers=normal_user_token_headers
    )
    assert join_resp.status_code == 200
    assert join_resp.json()["msg"] == "Successfully joined the group"

def test_join_group_already_member(client: TestClient, normal_user_token_headers):
    # Create a group
    group_resp = client.post(
        f"{settings.API_V1_STR}/groups/",
        headers=normal_user_token_headers,
        json={"name": "My Own Group"}
    )
    group_id = group_resp.json()["id"]

    # Try to join self-created group
    join_resp = client.post(
        f"{settings.API_V1_STR}/groups/{group_id}/join",
        headers=normal_user_token_headers
    )
    assert join_resp.status_code == 400

def test_join_nonexistent_group(client: TestClient, normal_user_token_headers):
    join_resp = client.post(
        f"{settings.API_V1_STR}/groups/999999/join",
        headers=normal_user_token_headers
    )
    assert join_resp.status_code == 404
