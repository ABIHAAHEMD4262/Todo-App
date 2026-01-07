#!/usr/bin/env python3
"""
Debug script to test the TodoAgent directly with the same conditions as the API
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the agent
from app.agents import TodoAgent

def debug_agent():
    """Debug the agent with the same conditions as the API"""
    print("Debugging TodoAgent...")

    try:
        # Initialize the agent (this should work with our fake API key)
        agent = TodoAgent()
        print(f"[OK] Agent initialized successfully, client is None: {agent.client is None}")

        # Test the exact same call as the API would make
        print("\nCalling process_message with API-like parameters...")

        result = agent.process_message(
            user_id="12c3eyIt7g_CF57Us4ok8w",  # Same user ID from our test
            message="Hello, can you help me manage my tasks?",
            conversation_id=None
        )

        print(f"[OK] process_message completed")
        print(f"Response: {result['response']}")
        print(f"Conversation ID: {result['conversation_id']}")
        print(f"Tool calls: {result['tool_calls']}")

        return True

    except Exception as e:
        print(f"[ERROR] Error during debugging: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = debug_agent()
    if success:
        print("\n[SUCCESS] Debug completed successfully!")
    else:
        print("\n[ERROR] Debug found issues!")