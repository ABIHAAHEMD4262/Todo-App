#!/usr/bin/env python3
"""
Test script to simulate the exact server call to debug the issue
"""
import os
os.environ["OPENAI_API_KEY"] = "fake_key_for_testing"

from app.agents import TodoAgent

def test_exact_server_call():
    """Test the exact call that the server makes"""
    print("Testing exact server call...")

    try:
        # Initialize the agent (this should work with fake key)
        agent = TodoAgent()
        print(f"Agent initialized. Client is None: {agent.client is None}")

        # Make the exact same call as the server
        result = agent.process_message(
            user_id="12c3eyIt7g_CF57Us4ok8w",
            message="Hello, can you help me manage my tasks?",
            conversation_id=None
        )

        print(f"Success! Result: {result}")
        return True

    except Exception as e:
        print(f"Error in test: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    test_exact_server_call()