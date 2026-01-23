"""
Tags API Routes - Todo App Phase V
Referencing: @specs/phase5-advanced-cloud/spec.md
Task: 5.3.5
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.auth import get_current_user
from app.models import User, Tag, TaskTag
from app.schemas import (
    TagCreate,
    TagUpdate,
    TagResponse,
    TagListResponse
)
from datetime import datetime

router = APIRouter()


# ============================================================================
# List Tags
# ============================================================================

@router.get("/{user_id}/tags", response_model=TagListResponse)
async def list_tags(
    user_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List all tags for user."""
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    statement = select(Tag).where(Tag.user_id == user_id).order_by(Tag.name)
    tags = session.exec(statement).all()

    tag_responses = [
        TagResponse(id=tag.id, name=tag.name, color=tag.color)
        for tag in tags
    ]

    return TagListResponse(tags=tag_responses, total=len(tag_responses))


# ============================================================================
# Create Tag
# ============================================================================

@router.post("/{user_id}/tags", response_model=TagResponse, status_code=201)
async def create_tag(
    user_id: str,
    tag_data: TagCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new tag."""
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Check for duplicate tag name
    existing_tag = session.exec(
        select(Tag).where(
            Tag.user_id == user_id,
            Tag.name == tag_data.name.strip()
        )
    ).first()

    if existing_tag:
        raise HTTPException(
            status_code=400,
            detail=f"Tag '{tag_data.name}' already exists"
        )

    # Create tag
    tag = Tag(
        user_id=user_id,
        name=tag_data.name.strip(),
        color=tag_data.color
    )

    session.add(tag)
    session.commit()
    session.refresh(tag)

    return TagResponse(id=tag.id, name=tag.name, color=tag.color)


# ============================================================================
# Get Single Tag
# ============================================================================

@router.get("/{user_id}/tags/{tag_id}", response_model=TagResponse)
async def get_tag(
    user_id: str,
    tag_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a single tag by ID."""
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    tag = session.exec(
        select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
    ).first()

    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    return TagResponse(id=tag.id, name=tag.name, color=tag.color)


# ============================================================================
# Update Tag
# ============================================================================

@router.put("/{user_id}/tags/{tag_id}", response_model=TagResponse)
async def update_tag(
    user_id: str,
    tag_id: int,
    tag_data: TagUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a tag."""
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get tag
    tag = session.exec(
        select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
    ).first()

    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Check for duplicate name if name is being updated
    if tag_data.name is not None:
        existing_tag = session.exec(
            select(Tag).where(
                Tag.user_id == user_id,
                Tag.name == tag_data.name.strip(),
                Tag.id != tag_id
            )
        ).first()

        if existing_tag:
            raise HTTPException(
                status_code=400,
                detail=f"Tag '{tag_data.name}' already exists"
            )

        tag.name = tag_data.name.strip()

    if tag_data.color is not None:
        tag.color = tag_data.color

    session.add(tag)
    session.commit()
    session.refresh(tag)

    return TagResponse(id=tag.id, name=tag.name, color=tag.color)


# ============================================================================
# Delete Tag
# ============================================================================

@router.delete("/{user_id}/tags/{tag_id}", status_code=204)
async def delete_tag(
    user_id: str,
    tag_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a tag. This will also remove the tag from all tasks."""
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get tag
    tag = session.exec(
        select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
    ).first()

    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Delete tag (cascade will remove task_tags)
    session.delete(tag)
    session.commit()
