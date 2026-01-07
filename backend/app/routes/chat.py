"""
Chat API Routes - Todo Chatbot Phase 3

This module implements the chat endpoint that integrates with the AI agent
and MCP tools for natural language task management.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from app.database import get_session
from app.auth import get_current_user
from app.models import User, Conversation, Message
from app.agents import TodoAgent
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


router = APIRouter()


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    conversation_id: Optional[int] = None
    message: str


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    conversation_id: int
    response: str
    tool_calls: List[str]


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Chat endpoint that processes natural language commands and returns AI response.

    This endpoint is stateless - it retrieves conversation history from the database,
    processes the message with the AI agent using MCP tools, and saves the results.
    """
    print(f"Chat endpoint called for user_id: {user_id}")

    # Verify that the user_id in the path matches the authenticated user
    if current_user.id != user_id:
        print(f"Access denied: {current_user.id} != {user_id}")
        raise HTTPException(
            status_code=403,
            detail="Access denied: Cannot access another user's chat"
        )

    try:
        # Validate input
        if not request.message or not request.message.strip():
            print("Empty message received")
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )

        print(f"Valid message received: {request.message[:50]}...")

        # Initialize the AI agent
        try:
            print(f"Initializing TodoAgent...")
            agent = TodoAgent()
            print(f"Agent initialized successfully. Client is None: {agent.client is None}")
        except Exception as e:
            import traceback
            print(f"Error initializing agent: {str(e)}")
            print(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail="Failed to initialize the AI agent"
            )

        # Process the message with the agent
        try:
            print(f"Processing message with agent...")
            result = agent.process_message(
                user_id=user_id,
                message=request.message,
                conversation_id=request.conversation_id
            )
            print(f"Message processed successfully. Result: {result}")
        except Exception as e:
            import traceback
            print(f"Error processing message in agent: {str(e)}")
            print(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail="Failed to process the message with the AI agent"
            )

        print(f"Returning response with conversation_id: {result['conversation_id']}")

        response = ChatResponse(
            conversation_id=result["conversation_id"],
            response=result["response"],
            tool_calls=result["tool_calls"]
        )
        print(f"ChatResponse created successfully")
        return response

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        print("HTTPException caught and re-raised")
        raise
    except Exception as e:
        # Log the error for debugging with full traceback
        import traceback
        print(f"General Error in chat endpoint: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred while processing your message"
        )


@router.get("/{user_id}/conversations", response_model=List[Dict[str, Any]])
async def list_conversations(
    user_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all conversations for a user.
    """
    # Verify that the user_id in the path matches the authenticated user
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied: Cannot access another user's conversations"
        )

    try:
        # Query conversations for the user
        conversations = session.exec(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        ).all()

        # Format response
        result = []
        for conv in conversations:
            # Get the last message in the conversation for preview
            last_message = session.exec(
                select(Message)
                .where(Message.conversation_id == conv.id)
                .order_by(Message.created_at.desc())
                .limit(1)
            ).first()

            result.append({
                "id": conv.id,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at,
                "last_message": last_message.content if last_message else "",
                "last_message_role": last_message.role if last_message else None
            })

        return result

    except Exception as e:
        print(f"Error listing conversations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving conversations"
        )


@router.get("/{user_id}/conversations/{conversation_id}/messages", response_model=List[Dict[str, Any]])
async def get_conversation_messages(
    user_id: str,
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all messages for a specific conversation.
    """
    # Verify that the user_id in the path matches the authenticated user
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied: Cannot access another user's conversations"
        )

    try:
        # Verify the conversation belongs to the user
        conversation = session.exec(
            select(Conversation)
            .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
        ).first()

        if not conversation:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

        # Get messages for the conversation
        messages = session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        ).all()

        # Format response
        result = []
        for msg in messages:
            result.append({
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at
            })

        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting conversation messages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving conversation messages"
        )