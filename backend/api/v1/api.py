from api.routes import auth, expenses, groups
from fastapi import APIRouter

# Other modules will be imported here later
# from api.v1.endpoints import users, expenses

api_router = APIRouter()


api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(groups.router, prefix="/groups", tags=["groups"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])


# Temporarily create a test endpoint to check router functionality
@api_router.get("/ping")
def ping():
    return {"ping": "pong from v1 router"}
