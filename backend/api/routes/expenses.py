from decimal import Decimal
from api.deps import CurrentUser, SessionDep
from fastapi import APIRouter, HTTPException
from models.expense_share import ExpenseShare
from models.expenses import Expense
from models.group_member import GroupMember
from schemas.expense import ExpenseCreate, ExpenseRead
from sqlmodel import select

router = APIRouter()


@router.post("/", response_model=ExpenseRead)
def create_expense(
    expense_in: ExpenseCreate,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Create a new expense in a group.
    The current user is set as the payer of the expense.
    """
    # Verify that the current user is a member of the group
    membership_statement = select(GroupMember).where(
        GroupMember.group_id == expense_in.group_id,
        GroupMember.user_id == current_user.id,
    )
    membership = session.exec(membership_statement).first()
    if not membership:
        raise HTTPException(
            status_code=403, detail="You are not a member of this group."
        )

    # Create the expense
    expense = Expense(
        amount=expense_in.amount,
        description=expense_in.description,
        group_id=expense_in.group_id,
        payer_id=current_user.id,
    )
    session.add(expense)
    session.flush()

    # Retrieve all group members to split the expense
    members = session.exec(
        select(GroupMember).where(GroupMember.group_id == expense_in.group_id)
    ).all()

    if not members:
        raise HTTPException(status_code=400, detail="Group has no members")

    total_members = len(members)
    split_amount = round(Decimal(expense.amount) / Decimal(total_members), 2)

    shares = []
    for member in members:
        is_paid = member.user_id == current_user.id
        share = ExpenseShare(
            expense_id=expense.id,
            user_id=member.user_id,
            amount=split_amount,
            is_paid=is_paid,
        )
        shares.append(share)
        session.add(share)

    session.commit()

    # Refresh expense to include shares
    session.refresh(expense)
    
    return ExpenseRead(**expense.model_dump(), shares=shares)

