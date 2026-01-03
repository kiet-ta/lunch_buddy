from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlmodel import SQLModel


class ExpenseBase(SQLModel):
    amount: Decimal
    description: Optional[str] = None
    group_id: int


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseShareRead(SQLModel):
    user_id: int
    amount: Decimal
    is_paid: bool


class ExpenseRead(ExpenseBase):
    id: int
    date: datetime
    payer_id: int
    shares: List[ExpenseShareRead] = []
