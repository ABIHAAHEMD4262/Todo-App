"""
OpenAI Agents SDK Integration - Todo Chatbot Phase 3
Properly integrated with MCP server tools for task operations
"""

import os
from typing import Dict, Any, Optional
from openai import OpenAI
from openai.types.beta.assistant import Assistant
from sqlmodel import Session, select
from app.database import engine
from app.models import User, Conversation, Message, Task
from dotenv import load_dotenv
from datetime import datetime
import json

# Load environment variables from .env file
load_dotenv()

class TodoAgent:
    def __init__(self):
        """Initialize the Todo Agent with OpenAI API and MCP integration."""
        try:
            # Get OpenAI API key
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if not openai_api_key:
                print("WARNING: OPENAI_API_KEY environment variable is not set")
                self.client = None
            else:
                # Check if this looks like a fake/test key
                if "fake" in openai_api_key.lower() or "test" in openai_api_key.lower():
                    print("WARNING: Detected test API key, using mock client")
                    self.client = None
                else:
                    # Initialize OpenAI client
                    try:
                        self.client = OpenAI(api_key=openai_api_key)
                    except Exception as e:
                        print(f"WARNING: Error initializing OpenAI client: {str(e)}")
                        print("Using mock client for testing purposes")
                        self.client = None
        except Exception as init_error:
            # If there's any error during initialization, fall back to mock client
            print(f"WARNING: Error during agent initialization: {str(init_error)}")
            self.client = None

        # Define tools for task operations (these should match MCP server tools)
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Create a new task for the authenticated user. The user_id is automatically provided.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "The title of the task (required)"},
                            "description": {"type": "string", "description": "The description of the task (optional)"}
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "Retrieve tasks for the authenticated user. The user_id is automatically provided.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "status": {"type": "string", "description": "Filter tasks by status: 'all', 'pending', or 'completed'", "enum": ["all", "pending", "completed"]}
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as complete for the authenticated user. The user_id is automatically provided.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "integer", "description": "The ID of the task to mark as complete"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Remove a task from the authenticated user's list. The user_id is automatically provided.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "integer", "description": "The ID of the task to delete"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Modify a task's title or description for the authenticated user. The user_id is automatically provided.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "integer", "description": "The ID of the task to update"},
                            "title": {"type": "string", "description": "The new title for the task (optional)"},
                            "description": {"type": "string", "description": "The new description for the task (optional)"}
                        },
                        "required": ["task_id"]
                    }
                }
            }
        ]

    def _get_system_prompt(self) -> str:
        """Get the system prompt for the AI agent."""
        return """
        You are a helpful AI assistant that manages todo tasks through natural language.

        IMPORTANT: The user is already authenticated. You already have access to their user_id automatically.
        You do NOT need to ask the user for their user_id - it is provided to you automatically in all tool calls.

        You can help users with these 5 core operations by using the available tools:
        1. Add new tasks with add_task (include title and optional description)
        2. List existing tasks with list_tasks (can filter by status: all, pending, completed)
        3. Mark tasks as complete with complete_task (requires task_id)
        4. Delete tasks with delete_task (requires task_id)
        5. Update task details with update_task (requires task_id, can update title and/or description)

        CRITICAL WORKFLOW FOR DELETE AND UPDATE OPERATIONS:

        When a user refers to a task by NAME or DESCRIPTION (not ID), you MUST:
        1. First call list_tasks to see all tasks and find the matching task_id
        2. Extract the task_id from the list_tasks result
        3. Then call delete_task or update_task with that task_id

        IMPORTANT: Do NOT just say "I found the task, I'll delete it" - you MUST ACTUALLY CALL THE TOOL.

        Examples of user requests and how to handle them:

        User: "Delete Science Homework"
        Response: [Call list_tasks → Find task with ID 3 titled "Science Homework" → Call delete_task(task_id=3)]

        User: "Update Science Homework title to Chemistry Homework"
        Response: [Call list_tasks → Find task with ID 3 titled "Science Homework" → Call update_task(task_id=3, title="Chemistry Homework")]

        User: "Delete task 3"
        Response: [Call delete_task(task_id=3)]

        User: "Update task 3 title to buy groceries"
        Response: [Call update_task(task_id=3, title="buy groceries")]

        NEVER stop after finding a task. Always follow through with the actual deletion or update by calling the appropriate tool function.

        Common phrases for delete: "delete task X", "remove task X", "get rid of task X", "trash task X", "delete [task name]"
        Common phrases for update: "change task X", "update task X", "modify task X", "edit task X", "rename task X", "update [task name]"

        When the user asks to see their tasks, immediately call list_tasks with the appropriate status.
        When the user wants to add a task, immediately call add_task with the title they provide.
        When the user wants to complete a task, immediately call complete_task with the task_id.

        Always use the available tools to perform actions.
        Be helpful and conversational in your responses.
        NEVER ask the user for their user_id - you already have it.
        """

    def _get_or_create_conversation(self, user_id: str, conversation_id: Optional[int] = None) -> int:
        """Get an existing conversation or create a new one. Returns conversation ID."""
        try:
            with Session(engine) as session:
                if conversation_id:
                    conversation = session.exec(
                        select(Conversation).where(
                            Conversation.id == conversation_id,
                            Conversation.user_id == user_id
                        )
                    ).first()

                    if conversation:
                        conversation.updated_at = datetime.utcnow()
                        session.add(conversation)
                        session.commit()
                        return conversation.id

                # Check if user exists first to avoid foreign key constraint
                user_exists = session.exec(
                    select(User).where(User.id == user_id)
                ).first()

                if not user_exists:
                    # User doesn't exist in DB, return -1 to indicate no persistence
                    return -1

                new_conversation = Conversation(
                    user_id=user_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )

                session.add(new_conversation)
                session.commit()
                session.refresh(new_conversation)

                return new_conversation.id
        except Exception as e:
            print(f"Error in _get_or_create_conversation: {str(e)}")
            # Fallback - return -1 to indicate failure but allow processing to continue
            return -1  # Indicate failure but allow processing to continue

    def _save_message(self, conversation_id: int, user_id: str, role: str, content: str):
        """Save a message to the conversation history."""
        # Only save to DB if we have a valid conversation ID
        if conversation_id == -1:
            return  # Skip saving if conversation creation failed

        try:
            with Session(engine) as session:
                message = Message(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    role=role,
                    content=content,
                    created_at=datetime.utcnow()
                )

                session.add(message)
                session.commit()
        except Exception as e:
            print(f"Error saving message to DB: {str(e)}")
            # Continue without DB persistence if saving fails

    def process_message(self, user_id: str, message: str, conversation_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Process a user message and return an AI response using OpenAI API.
        Integrates with MCP tools for task operations.
        """
        import sys
        print(f"DEBUG: Starting process_message for user {user_id}", file=sys.stderr)

        # Double-check that client is still valid (in case environment changed)
        try:
            if self.client is not None:
                # Try to access the client to see if it's still valid
                _ = self.client.api_key  # This will raise an exception if client is invalid
        except:
            # If there's any issue with the client object, treat as None
            print("DEBUG: Client object is invalid, switching to mock client path", file=sys.stderr)
            self.client = None

        try:
            # Check if OpenAI client is available
            print(f"DEBUG: Client is None: {self.client is None}", file=sys.stderr)
            if self.client is None:
                print("DEBUG: Using mock client path", file=sys.stderr)
                # When using mock client (fake API key), bypass database operations
                # and return a simple response immediately
                response = f"I received your message: '{message}'. I can help you manage your tasks (add, list, complete, update, delete) when the AI service is available."

                # Return a fixed conversation ID of -1 to indicate no persistence
                # but with a meaningful response
                return {
                    "conversation_id": -1,  # No conversation persistence with mock client
                    "response": response,
                    "tool_calls": []
                }

            print("DEBUG: Using real API client path")
            # For real API keys, proceed with normal operation
            # Create or retrieve conversation (returns ID)
            try:
                print("DEBUG: Creating/retrieving conversation")
                conv_id = self._get_or_create_conversation(user_id, conversation_id)
                print(f"DEBUG: Conversation ID: {conv_id}")
            except Exception as e:
                print(f"Error creating conversation: {str(e)}")
                conv_id = -1  # Use fallback if conversation creation fails

            # Prepare messages for OpenAI
            openai_messages = [{"role": "system", "content": self._get_system_prompt()}]
            openai_messages.append({"role": "user", "content": message})

            # Save the user message to conversation history
            try:
                if conv_id != -1:  # Only save if conversation creation was successful
                    print("DEBUG: Saving user message to conversation")
                    self._save_message(conv_id, user_id, "user", message)
            except Exception as e:
                print(f"Error saving user message: {str(e)}")
                pass  # Continue without saving if DB fails

            # Make the API call to OpenAI with tools
            # Support multi-turn tool calling
            print("DEBUG: Making OpenAI API call")
            messages_so_far = openai_messages.copy()
            all_tool_calls = []
            max_iterations = 5  # Prevent infinite loops
            iteration = 0
            response_message = None  # Initialize outside the loop

            while iteration < max_iterations:
                try:
                    response = self.client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=messages_so_far,
                        tools=self.tools,
                        tool_choice="auto",
                        temperature=0.7,
                        timeout=30
                    )
                    print(f"DEBUG: OpenAI API call succeeded (iteration {iteration})")
                except Exception as api_error:
                    print(f"DEBUG: OpenAI API call failed: {str(api_error)}")
                    # If API fails, return a simple response
                    fallback_response = f"I received your message: '{message}'. The AI service is temporarily unavailable, but I can help manage your tasks when it's back online."

                    try:
                        if conv_id != -1:  # Only save if conversation creation was successful
                            self._save_message(conv_id, user_id, "assistant", fallback_response)
                    except Exception as e:
                        print(f"Error saving fallback response: {str(e)}")
                        pass

                    return {
                        "conversation_id": conv_id,
                        "response": fallback_response,
                        "tool_calls": [tc.function.name for tc in all_tool_calls]
                    }

                # Process the response
                try:
                    response_message = response.choices[0].message
                    tool_calls = response_message.tool_calls
                    print(f"DEBUG: Tool calls found in iteration {iteration}: {bool(tool_calls)}")
                except (IndexError, AttributeError) as e:
                    print(f"Error processing API response: {str(e)}")
                    fallback_response = "I received your message. There was an issue processing the response from the AI service."

                    try:
                        if conv_id != -1:
                            self._save_message(conv_id, user_id, "assistant", fallback_response)
                    except Exception as save_error:
                        print(f"Error saving fallback response: {str(save_error)}")
                        pass

                    return {
                        "conversation_id": conv_id,
                        "response": fallback_response,
                        "tool_calls": [tc.function.name for tc in all_tool_calls]
                    }

                if not tool_calls:
                    # No more tool calls, we're done
                    print(f"DEBUG: No tool calls in iteration {iteration}, finished")
                    break

                # Execute tool calls and get results
                print(f"DEBUG: Processing {len(tool_calls)} tool calls in iteration {iteration}")
                tool_results = []
                for tool_call in tool_calls:
                    try:
                        function_name = tool_call.function.name
                        all_tool_calls.append(tool_call)

                        # Parse the function arguments with error handling
                        try:
                            function_args = json.loads(tool_call.function.arguments)
                        except json.JSONDecodeError as json_error:
                            print(f"Error parsing tool arguments: {str(json_error)}")
                            tool_results.append({
                                "tool_call_id": tool_call.id,
                                "role": "tool",
                                "name": function_name,
                                "content": json.dumps({
                                    "success": False,
                                    "error": f"Invalid JSON in tool arguments: {str(json_error)}"
                                })
                            })
                            continue

                        function_args["user_id"] = user_id

                        print(f"[DEBUG] Executing tool call: {function_name} with args: {function_args}")

                        # Execute the actual tool function by calling the corresponding method
                        if function_name == "add_task":
                            tool_result = self._execute_add_task(function_args)
                        elif function_name == "list_tasks":
                            tool_result = self._execute_list_tasks(function_args)
                        elif function_name == "complete_task":
                            tool_result = self._execute_complete_task(function_args)
                        elif function_name == "delete_task":
                            tool_result = self._execute_delete_task(function_args)
                        elif function_name == "update_task":
                            tool_result = self._execute_update_task(function_args)
                        else:
                            print(f"[DEBUG] Unknown function: {function_name}")
                            tool_result = {
                                "success": False,
                                "error": f"Unknown function: {function_name}"
                            }

                        print(f"[DEBUG] Tool result for {function_name}: {tool_result}")

                        tool_results.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": json.dumps(tool_result)
                        })
                    except Exception as e:
                        print(f"Error executing tool call: {str(e)}")
                        import traceback
                        print(f"Full traceback for tool call: {traceback.format_exc()}")
                        tool_results.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": tool_call.function.name,
                            "content": json.dumps({
                                "success": False,
                                "error": str(e)
                            })
                        })

                # Add the assistant message and tool results to messages for next iteration
                messages_so_far.append(response_message)
                messages_so_far.extend(tool_results)

                iteration += 1

            # Get final response
            if response_message is None:
                # No response was ever created (shouldn't happen, but handle gracefully)
                print("WARNING: response_message is None after loop")
                final_content = "I processed your request."
            else:
                final_content = response_message.content

            if not final_content and iteration > 0:
                # If we did tool calls but no final content, make one more call to get the response
                try:
                    final_response = self.client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=messages_so_far,
                        temperature=0.7,
                        timeout=30
                    )
                    final_content = final_response.choices[0].message.content
                    print("DEBUG: Final API call succeeded")
                except Exception as second_api_error:
                    print(f"Error in final API call: {str(second_api_error)}")
                    final_content = f"Action completed successfully."

            # Save the assistant's final response to conversation history
            try:
                if conv_id != -1 and final_content:
                    print("DEBUG: Saving assistant message to conversation")
                    self._save_message(conv_id, user_id, "assistant", final_content)
            except Exception as e:
                print(f"Error saving assistant message: {str(e)}")
                pass  # Continue without saving if DB fails

            # Return successful response
            return {
                "conversation_id": conv_id,
                "response": final_content or "I've processed your request.",
                "tool_calls": [tc.function.name for tc in all_tool_calls]
            }

        except Exception as e:
            # Log the error and return a simple fallback
            import traceback
            print(f"Critical error processing message: {str(e)}")
            print(f"Full traceback: {traceback.format_exc()}")

            # For mock client scenario, just return a simple response
            if self.client is None:
                return {
                    "conversation_id": -1,
                    "response": f"I received your message: '{message}'. I can help you manage your tasks when the AI service is available.",
                    "tool_calls": []
                }

            # Try to create a conversation for error logging, but don't fail if it doesn't work
            try:
                conv_id = self._get_or_create_conversation(user_id, conversation_id)
            except:
                conv_id = -1  # Use fallback if conversation creation fails

            fallback_response = "I'm sorry, I encountered an error processing your request. Please try again."

            try:
                # Only save messages if conversation creation was successful
                if conv_id != -1:
                    self._save_message(conv_id, user_id, "user", message)
                    self._save_message(conv_id, user_id, "assistant", fallback_response)
            except Exception as save_error:
                print(f"Error saving error response: {str(save_error)}")
                pass  # Continue even if message saving fails

            return {
                "conversation_id": conv_id,
                "response": fallback_response,
                "tool_calls": []
            }

    def _execute_add_task(self, args: dict) -> dict:
        """Execute the add_task function."""
        try:
            user_id = args["user_id"]
            title = args["title"]
            description = args.get("description")

            with Session(engine) as session:
                # Verify user exists
                user = session.exec(select(User).where(User.id == user_id)).first()
                if not user:
                    return {
                        "success": False,
                        "error": f"User {user_id} not found"
                    }

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

                return {
                    "success": True,
                    "data": f"Successfully created task: {task.title} (ID: {task.id})"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _execute_list_tasks(self, args: dict) -> dict:
        """Execute the list_tasks function."""
        try:
            user_id = args["user_id"]
            status = args.get("status", "all")

            with Session(engine) as session:
                # Verify user exists
                user = session.exec(select(User).where(User.id == user_id)).first()
                if not user:
                    return {
                        "success": False,
                        "error": f"User {user_id} not found"
                    }

                # Build query based on status filter
                query = select(Task).where(Task.user_id == user_id)

                if status == "pending":
                    query = query.where(Task.completed == False)
                elif status == "completed":
                    query = query.where(Task.completed == True)

                tasks = session.exec(query.order_by(Task.created_at.desc())).all()

                if not tasks:
                    return {
                        "success": True,
                        "data": "No tasks found for this user."
                    }

                task_list = []
                for task in tasks:
                    status_text = "completed" if task.completed else "pending"
                    task_list.append(f"ID: {task.id}, Title: {task.title}, Status: {status_text}")

                task_str = "\n".join(task_list)

                return {
                    "success": True,
                    "data": f"Tasks for user {user_id} ({status}):\n{task_str}"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _execute_complete_task(self, args: dict) -> dict:
        """Execute the complete_task function."""
        try:
            user_id = args["user_id"]
            task_id = args["task_id"]

            with Session(engine) as session:
                # Find the specific task for this user
                task = session.exec(
                    select(Task).where(Task.id == task_id, Task.user_id == user_id)
                ).first()

                if not task:
                    return {
                        "success": False,
                        "error": f"Task {task_id} not found for user {user_id}"
                    }

                # Mark as complete
                task.completed = True
                task.updated_at = datetime.utcnow()
                session.add(task)
                session.commit()

                return {
                    "success": True,
                    "data": f"Successfully marked task '{task.title}' as complete."
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _execute_delete_task(self, args: dict) -> dict:
        """Execute the delete_task function."""
        try:
            user_id = args.get("user_id")
            task_id = args.get("task_id")

            print(f"[DEBUG] _execute_delete_task called with user_id={user_id}, task_id={task_id}")

            if not user_id or not task_id:
                return {
                    "success": False,
                    "error": "Missing required parameters: user_id and task_id are required"
                }

            with Session(engine) as session:
                # Find the specific task for this user
                task = session.exec(
                    select(Task).where(Task.id == task_id, Task.user_id == user_id)
                ).first()

                if not task:
                    print(f"[DEBUG] Task not found: task_id={task_id}, user_id={user_id}")
                    return {
                        "success": False,
                        "error": f"Task {task_id} not found for user {user_id}"
                    }

                print(f"[DEBUG] Found task to delete: {task.title}")

                # Capture task title before deletion
                task_title = task.title

                # Delete the task
                session.delete(task)
                session.commit()

                print(f"[DEBUG] Successfully deleted task {task_id}")

                return {
                    "success": True,
                    "data": f"Successfully deleted task '{task_title}'."
                }
        except Exception as e:
            print(f"[ERROR] Exception in _execute_delete_task: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e)
            }

    def _execute_update_task(self, args: dict) -> dict:
        """Execute the update_task function."""
        try:
            user_id = args.get("user_id")
            task_id = args.get("task_id")
            new_title = args.get("title")
            new_description = args.get("description")

            print(f"[DEBUG] _execute_update_task called with user_id={user_id}, task_id={task_id}, title={new_title}, description={new_description}")

            if not user_id or not task_id:
                return {
                    "success": False,
                    "error": "Missing required parameters: user_id and task_id are required"
                }

            if new_title is None and new_description is None:
                return {
                    "success": False,
                    "error": "At least one of 'title' or 'description' must be provided for update"
                }

            with Session(engine) as session:
                # Find the specific task for this user
                task = session.exec(
                    select(Task).where(Task.id == task_id, Task.user_id == user_id)
                ).first()

                if not task:
                    print(f"[DEBUG] Task not found: task_id={task_id}, user_id={user_id}")
                    return {
                        "success": False,
                        "error": f"Task {task_id} not found for user {user_id}"
                    }

                print(f"[DEBUG] Found task to update: {task.title}")

                # Update fields if provided
                updated_fields = []
                if new_title is not None:
                    task.title = new_title
                    updated_fields.append("title")
                if new_description is not None:
                    task.description = new_description
                    updated_fields.append("description")

                task.updated_at = datetime.utcnow()
                session.add(task)
                session.commit()
                session.refresh(task)

                print(f"[DEBUG] Successfully updated task {task_id}, fields: {updated_fields}")

                return {
                    "success": True,
                    "data": f"Successfully updated task. New title: '{task.title}', Description: '{task.description or 'N/A'}'"
                }
        except Exception as e:
            print(f"[ERROR] Exception in _execute_update_task: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e)
            }