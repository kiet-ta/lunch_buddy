from decimal import Decimal
from typing import Optional

from sqlmodel import Field, SQLModel


class ExpenseShare(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    expense_id: int = Field(foreign_key="expense.id", nullable=False)
    user_id: int = Field(foreign_key="user.id", nullable=False)
    amount: Decimal = Field(nullable=False, max_digits=12, decimal_places=2, ge=0)
    is_paid: bool = Field(default=False, nullable=False)
