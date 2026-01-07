"""
MCP Server for Todo Chatbot - Phase 3 Implementation

This server exposes task operations as MCP tools that can be used by AI agents
to manage todo tasks through natural language commands.
"""
import asyncio
from mcp.server import Server
from mcp.types import TextContent, Completion, CompletionMessage
from mcp.server.tool_utils import Params
from sqlmodel import Session, select
from app.database import engine
from app.models import User, Task
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create MCP server
server = Server(
    name="todo-mcp-server",
    version="1.0.0",
    description="MCP server for Todo Chatbot operations"
)

# Tool for adding a task
@server.tools.register(
    name="add_task",
    description="Create a new task",
    input_schema={
        "type": "object",
        "properties": {
            "user_id": {"type": "string", "description": "The ID of the user creating the task"},
            "title": {"type": "string", "description": "The title of the task (required)"},
            "description": {"type": "string", "description": "The description of the task (optional)"}
        },
        "required": ["user_id", "title"]
    }
)
async def handle_add_task(context, params: Params) -> Completion:
    """Handle add_task tool call."""
    user_id = params["user_id"]
    title = params["title"]
    description = params.get("description")

    try:
        with Session(engine) as session:
            # Verify user exists
            user = session.exec(select(User).where(User.id == user_id)).first()
            if not user:
                return Completion(
                    messages=[CompletionMessage(
                        role="assistant",
                        content=TextContent(
                            type="text",
                            text=f"Error: User {user_id} not found"
                        )
                    )]
                )

            # Create new task
            task = Task(
                user_id=user_id,
                title=title,
                description=description,
                completed=False
            )

            session.add(task)
            session.commit()
            session.refresh(task)

            return Completion(
                messages=[CompletionMessage(
                    role="assistant",
                    content=TextContent(
                        type="text",
                        text=f"Successfully created task: {task.title} (ID: {task.id})"
                    )
                )]
            )
    except Exception as e:
        return Completion(
            messages=[CompletionMessage(
                role="assistant",
                content=TextContent(
                    type="text",
                    text=f"Error creating task: {str(e)}"
                )
            )]
        )

# Tool for listing tasks
@server.tools.register(
    name="list_tasks",
    description="Retrieve tasks from the list",
    input_schema={
        "type": "object",
        "properties": {
            "user_id": {"type": "string", "description": "The ID of the user whose tasks to retrieve"},
            "status": {"type": "string", "description": "Filter tasks by status: 'all', 'pending', or 'completed'", "enum": ["all", "pending", "completed"]}
        },
        "required": ["user_id"]
    }
)
async def handle_list_tasks(context, params: Params) -> Completion:
    """Handle list_tasks tool call."""
    user_id = params["user_id"]
    status = params.get("status", "all")

    try:
        with Session(engine) as session:
            # Verify user exists
            user = session.exec(select(User).where(User.id == user_id)).first()
            if not user:
                return Completion(
                    messages=[CompletionMessage(
                        role="assistant",
                        content=TextContent(
                            type="text",
                            text=f"Error: User {user_id} not found"
                        )
                    )]
                )

            # Build query based on status filter
            query = select(Task).where(Task.user_id == user_id)

            if status == "pending":
                query = query.where(Task.completed == False)
            elif status == "completed":
                query = query.where(Task.completed == True)

            tasks = session.exec(query.order_by(Task.created_at.desc())).all()

            if not tasks:
                return Completion(
                    messages=[CompletionMessage(
                        role="assistant",
                        content=TextContent(
                            type="text",
                            text="No tasks found for this user."
                        )
                    )]
                )

            task_list = []
            for task in tasks:
                status_text = "completed" if task.completed else "pending"
                task_list.append(f"ID: {task.id}, Title: {task.title}, Status: {status_text}")

            task_str = "\n".join(task_list)

            return Completion(
                messages=[CompletionMessage(
                    role="assistant",
                    content=TextContent(
                        type="text",
                        text=f"Tasks for user {user_id} ({status}):\n{task_str}"
                    )
                )]
            )
    except Exception as e:
        return Completion(
            messages=[CompletionMessage(
                role="assistant",
                content=TextContent(
                    type="text",
                    text=f"Error listing tasks: {str(e)}"
                )
            )]
        )

# Tool for completing a task
@server.tools.register(
    name="complete_task",
    description="Mark a task as complete",
    input_schema={
        "type": "object",
        "properties": {
            "user_id": {"type": "string", "description": "The ID of the user whose task to complete"},
            "task_id": {"type": "integer", "description": "The ID of the task to mark as complete"}
        },
        "required": ["user_id", "task_id"]
    }
)
async def handle_complete_task(context, params: Params) -> Completion:
    """Handle complete_task tool call."""
    user_id = params["user_id"]
    task_id = params["task_id"]

    try:
        with Session(engine) as session:
            # Find the specific task for this user
            task = session.exec(
                select(Task).where(Task.id == task_id, Task.user_id == user_id)
            ).first()

            if not task:
                return Completion(
                    messages=[CompletionMessage(
                        role="assistant",
                        content=TextContent(
                            type="text",
                            text=f"Error: Task {task_id} not found for user {user_id}"
                        )
                    )]
                )

            # Mark as complete
            task.completed = True
            session.add(task)
            session.commit()

            return Completion(
                messages=[CompletionMessage(
                    role="assistant",
                    content=TextContent(
                        type="text",
                        text=f"Successfully marked task '{task.title}' as complete."
                    )
                )]
            )
    except Exception as e:
        return Completion(
            messages=[CompletionMessage(
                role="assistant",
                content=TextContent(
                    type="text",
                    text=f"Error completing task: {str(e)}"
                )
            )]
        )

# Tool for deleting a task
@server.tools.register(
    name="delete_task",
    description="Remove a task from the list",
    input_schema={
        "type": "object",
        "properties": {
            "user_id": {"type": "string", "description": "The ID of the user whose task to delete"},
            "task_id": {"type": "integer", "description": "The ID of the task to delete"}
        },
        "required": ["user_id", "task_id"]
    }
)
async def handle_delete_task(context, params: Params) -> Completion:
    """Handle delete_task tool call."""
    user_id = params["user_id"]
    task_id = params["task_id"]

    try:
        with Session(engine) as session:
            # Find the specific task for this user
            task = session.exec(
                select(Task).where(Task.id == task_id, Task.user_id == user_id)
            ).first()

            if not task:
                return Completion(
                    messages=[CompletionMessage(
                        role="assistant",
                        content=TextContent(
                            type="text",
                            text=f"Error: Task {task_id} not found for user {user_id}"
                        )
                    )]
                )

            # Delete the task
            session.delete(task)
            session.commit()

            return Completion(
                messages=[CompletionMessage(
                    role="assistant",
                    content=TextContent(
                        type="text",
                        text=f"Successfully deleted task '{task.title}'."
                    )
                )]
            )
    except Exception as e:
        return Completion(
            messages=[CompletionMessage(
                role="assistant",
                content=TextContent(
                    type="text",
                    text=f"Error deleting task: {str(e)}"
                )
            )]
        )

# Tool for updating a task
@server.tools.register(
    name="update_task",
    description="Modify task title or description",
    input_schema={
        "type": "object",
        "properties": {
            "user_id": {"type": "string", "description": "The ID of the user whose task to update"},
            "task_id": {"type": "integer", "description": "The ID of the task to update"},
            "title": {"type": "string", "description": "The new title for the task (optional)"},
            "description": {"type": "string", "description": "The new description for the task (optional)"}
        },
        "required": ["user_id", "task_id"]
    }
)
async def handle_update_task(context, params: Params) -> Completion:
    """Handle update_task tool call."""
    user_id = params["user_id"]
    task_id = params["task_id"]
    new_title = params.get("title")
    new_description = params.get("description")

    try:
        with Session(engine) as session:
            # Find the specific task for this user
            task = session.exec(
                select(Task).where(Task.id == task_id, Task.user_id == user_id)
            ).first()

            if not task:
                return Completion(
                    messages=[CompletionMessage(
                        role="assistant",
                        content=TextContent(
                            type="text",
                            text=f"Error: Task {task_id} not found for user {user_id}"
                        )
                    )]
                )

            # Update fields if provided
            if new_title is not None:
                task.title = new_title
            if new_description is not None:
                task.description = new_description

            session.add(task)
            session.commit()
            session.refresh(task)

            return Completion(
                messages=[CompletionMessage(
                    role="assistant",
                    content=TextContent(
                        type="text",
                        text=f"Successfully updated task. New title: '{task.title}', Description: '{task.description or 'N/A'}'"
                    )
                )]
            )
    except Exception as e:
        return Completion(
            messages=[CompletionMessage(
                role="assistant",
                content=TextContent(
                    type="text",
                    text=f"Error updating task: {str(e)}"
                )
            )]
        )


async def main():
    """Run the MCP server."""
    from mcp.server.stdio import stdio_server
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream)


if __name__ == "__main__":
    asyncio.run(main())