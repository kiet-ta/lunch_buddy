from decimal import Decimal
from fastapi.testclient import TestClient
from core.config import settings

def test_create_expense_split(client: TestClient, normal_user_token_headers):
    # 1. Create a group
    group_resp = client.post(
        f"{settings.API_V1_STR}/groups/",
        headers=normal_user_token_headers,
        json={"name": "Expense Group"}
    )
    group_id = group_resp.json()["id"]

    # 2. Add another member to the group
    # Create User 2
    user2_data = {
        "email": "user2@example.com",
        "username": "user2",
        "first_name": "User",
        "last_name": "Two",
        "password": "password123"
    }
    client.post(f"{settings.API_V1_STR}/auth/signup", json=user2_data)
    
    # Login User 2
    resp = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token",
        data={"username": user2_data["email"], "password": user2_data["password"]}
    )
    user2_headers = {"Authorization": f"Bearer {resp.json()['access_token']}"}

    # Join Group
    client.post(
        f"{settings.API_V1_STR}/groups/{group_id}/join",
        headers=user2_headers
    )

    # 3. Create Expense (100.00)
    # normal_user creates it
    expense_data = {
        "amount": 100.00,
        "description": "Lunch",
        "group_id": group_id
    }
    resp = client.post(
        f"{settings.API_V1_STR}/expenses/",
        headers=normal_user_token_headers,
        json=expense_data
    )
    assert resp.status_code == 200
    data = resp.json()
    assert float(data["amount"]) == 100.00
    assert len(data["shares"]) == 2
    
    # Check splits (50.00 each)
    for share in data["shares"]:
        assert float(share["amount"]) == 50.00
        # Payer (normal_user) should be paid=True (logic might vary, let's check)
        # In current logic: is_paid = member.user_id == current_user.id
        # Wait, if I am the payer, my share is "paid" by definition? 
        # The logic in `expenses.py` says: `is_paid = member.user_id == current_user.id`
        # Yes, if I paid the whole bill, my share is paid. Others are not.

    # 4. Verify Not Member cannot create expense
    # Create User 3
    user3_data = {
        "email": "user3@example.com",
        "username": "user3",
        "first_name": "User",
        "last_name": "Three",
        "password": "password123"
    }
    client.post(f"{settings.API_V1_STR}/auth/signup", json=user3_data)
    resp = client.post(
        f"{settings.API_V1_STR}/auth/login/access-token",
        data={"username": user3_data["email"], "password": user3_data["password"]}
    )
    user3_headers = {"Authorization": f"Bearer {resp.json()['access_token']}"}

    resp = client.post(
        f"{settings.API_V1_STR}/expenses/",
        headers=user3_headers,
        json=expense_data
    )
    assert resp.status_code == 403
