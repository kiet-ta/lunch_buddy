from datetime import datetime, timezone
from decimal import Decimal

from sqlmodel import Field, SQLModel


class Expense(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    amount: Decimal = Field(nullable=False)
    description: str = Field(nullable=False)
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    group_id: int = Field(foreign_key="group.id", nullable=False)
    payer_id: int = Field(foreign_key="user.id", nullable=False)
