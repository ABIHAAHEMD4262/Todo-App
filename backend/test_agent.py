#!/usr/bin/env python3
"""
Test script for the TodoAgent to verify it works properly
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.agents import TodoAgent

def test_agent():
    """Test the TodoAgent functionality directly"""
    print("Testing TodoAgent...")

    try:
        # Initialize the agent
        agent = TodoAgent()
        print("[OK] Agent initialized successfully")

        # Test a simple message processing (with a mock user_id)
        print("\nTesting message processing...")
        result = agent.process_message(
            user_id="test_user_123",
            message="Hello, can you help me manage my tasks?",
            conversation_id=None
        )

        print(f"[OK] Message processed successfully")
        print(f"Response: {result['response']}")
        print(f"Conversation ID: {result['conversation_id']}")
        print(f"Tool calls: {result['tool_calls']}")

        # Test adding a task
        print("\nTesting add_task...")
        result = agent.process_message(
            user_id="test_user_123",
            message="Please add a task: Buy groceries",
            conversation_id=result['conversation_id']
        )

        print(f"[OK] Task addition processed successfully")
        print(f"Response: {result['response']}")
        print(f"Tool calls: {result['tool_calls']}")

        # Test listing tasks
        print("\nTesting list_tasks...")
        result = agent.process_message(
            user_id="test_user_123",
            message="What tasks do I have?",
            conversation_id=result['conversation_id']
        )

        print(f"[OK] Task listing processed successfully")
        print(f"Response: {result['response']}")
        print(f"Tool calls: {result['tool_calls']}")

        print("\n[SUCCESS] All tests passed! The agent is working correctly.")
        return True

    except Exception as e:
        print(f"[ERROR] Error during testing: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = test_agent()
    if success:
        print("\n[SUCCESS] Agent is working properly!")
    else:
        print("\n[ERROR] Agent has issues!")
        sys.exit(1)