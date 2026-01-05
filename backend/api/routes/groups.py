from datetime import datetime, timedelta
from typing import List

from api.deps import CurrentUser, SessionDep
from core.config import settings
from core.security import create_access_token
from fastapi import APIRouter, HTTPException
from jose import JWTError, jwt
from models.group import Group
from models.group_member import GroupMember
from schemas.group import GroupCreate, GroupInviteResponse, GroupRead, JoinGroupRequest
from sqlmodel import select

router = APIRouter()


@router.post("/", response_model=GroupRead)
def create_group(
    group_id: GroupCreate,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Create a new lunch group. .
    The creator will automatically be the first member (role=admin).
    """
    group = Group.model_validate(group_id)
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


@router.post("/{group_id}/invite", response_model=GroupInviteResponse)
def create_invite_link(
    group_id: int,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Generate an invitation link for a specific group.
    Only admins should be able to do this (logic omitted for brevity).
    """
    # 1. Verify group existence and user permission
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # TODO: Check if user is admin/member logic here...

    # 2. Create an invite token
    # We embed the group_id in the 'sub' or a custom claim
    # Set expiration to 24 hours for security
    invite_data = {"sub": str(group_id), "type": "invite"}
    invite_token = create_access_token(
        subject=str(group_id), expires_delta=timedelta(hours=24)
    )

    # 3. Construct the Deep Link
    # Schema must match app.json: "scheme": "lunchbuddy"
    deep_link = f"lunchbuddy://group/join?token={invite_token}"

    return GroupInviteResponse(
        invite_url=deep_link,
        qr_code_data=deep_link,
        expires_at=(datetime.now() + timedelta(hours=24)).isoformat(),
    )


@router.post("/join-by-token")
def join_group_by_token(
    payload: JoinGroupRequest,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Process joining a group using a signed invitation token.
    """
    token = payload.token

    try:
        # 1. Decode and validate token
        decoded = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        group_id = decoded.get("sub")

        # Ideally, check for a 'type': 'invite' claim to prevent misuse of auth tokens
        # if decoded.get("type") != "invite": raise ...

        if group_id is None:
            raise HTTPException(status_code=400, detail="Invalid token content")

    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # 2. Convert to int
    group_id = int(group_id)

    # 3. Check if user is already a member (Reuse logic)
    existing_member = session.exec(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
        )
    ).first()

    if existing_member:
        # Idempotency: If already member, just return success
        return {"msg": "You are already in this group"}

    # 4. Add member
    member = GroupMember(
        group_id=group_id,
        user_id=current_user.id,
        role="member",
    )
    session.add(member)
    session.commit()

    return {"msg": "Successfully joined the group via invite"}
