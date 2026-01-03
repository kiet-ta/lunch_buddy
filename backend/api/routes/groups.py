from typing import List

from api.deps import CurrentUser, SessionDep
from fastapi import APIRouter, HTTPException
from models.group import Group
from models.group_member import GroupMember
from schemas.group import GroupCreate, GroupRead
from sqlmodel import select

router = APIRouter()


@router.post("/", response_model=GroupRead)
def create_group(
    group_in: GroupCreate,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Create a new lunch group. .
    The creator will automatically be the first member (role=admin).
    """
    group = Group.model_validate(group_in)
    session.add(group)
    # Flush to get the group ID without committing the transaction yet
    session.flush()

    # Add the creator as an admin member of the group
    member = GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        role="admin",
    )
    session.add(member)
    session.commit()
    session.refresh(group)

    return group


@router.get("/", response_model=List[GroupRead])
def read_my_groups(
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Retrieve all lunch groups the current user is a member of.
    """

    statement = (
        select(Group).join(GroupMember).where(GroupMember.user_id == current_user.id)
    )
    groups = session.exec(statement).all()
    return groups


@router.post("/{group_id}/join")
def join_group(
    group_id: int,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Join an existing lunch group.
    # After can change to invite code
    """
    # Check if the group exists
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Check if the user is already a member
    existing_member = session.exec(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
        )
    ).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="Already a member of the group")

    # Add the user as a member of the group
    member = GroupMember(
        group_id=group_id,
        user_id=current_user.id,
        role="member",
    )
    session.add(member)
    session.commit()

    return {"msg": "Successfully joined the group"}
