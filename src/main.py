"""
Console Todo App - Main Entry Point
Phase I: In-memory CLI todo application
"""

import sys
import io

# Configure UTF-8 encoding for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')

from todo_manager import (
    add_task,
    get_tasks,
    update_task,
    delete_task,
    toggle_complete,
    find_task_by_id,
    tasks
)
from utils import format_task_list, validate_task_id


def display_menu():
    """Display the main menu."""
    print("\n" + "=" * 46)
    print("        TODO APP - PHASE I")
    print("=" * 46)
    print()
    print("1. Add New Task")
    print("2. View All Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Mark Task Complete/Incomplete")
    print("6. Exit")
    print()


def handle_add_task():
    """Handle adding a new task (US-1)."""
    print("\n--- Add New Task ---")

    # Prompt for title
    title = input("Enter task title: ")

    # Prompt for description
    description = input("Enter task description (optional): ")

    # Call add_task
    success, message, _ = add_task(title, description)

    # Display result
    print(f"\n{message}\n")


def handle_view_tasks():
    """Handle viewing all tasks (US-2)."""
    print("\n--- All Tasks ---\n")

    # Get tasks
    task_list = get_tasks()

    # Format and display
    output = format_task_list(task_list)
    print(output)
    print()


def handle_update_task():
    """Handle updating an existing task (US-3)."""
    print("\n--- Update Task ---")

    # Prompt for task ID
    task_id_input = input("Enter task ID to update: ")

    # Validate task ID
    is_valid, task_id, error = validate_task_id(task_id_input, tasks)
    if not is_valid:
        print(f"\n✗ Error: {error}\n")
        return

    # Check if task exists
    task = find_task_by_id(task_id)
    if task is None:
        print(f"\n✗ Error: Task #{task_id} not found\n")
        return

    # Show current values
    print(f"\nCurrent title: {task['title']}")
    print(f"Current description: {task['description']}")

    # Prompt for new title
    new_title_input = input("\nEnter new title (or press Enter to keep current): ")
    new_title = new_title_input if new_title_input else None

    # Prompt for new description
    new_desc_input = input("Enter new description (or press Enter to keep current): ")
    new_description = new_desc_input if new_desc_input else None

    # Call update_task
    success, message = update_task(task_id, new_title, new_description)

    # Display result
    print(f"\n{message}\n")


def handle_delete_task():
    """Handle deleting a task (US-4)."""
    print("\n--- Delete Task ---")

    # Prompt for task ID
    task_id_input = input("Enter task ID to delete: ")

    # Validate task ID
    is_valid, task_id, error = validate_task_id(task_id_input, tasks)
    if not is_valid:
        print(f"\n✗ Error: {error}\n")
        return

    # Check if task exists
    task = find_task_by_id(task_id)
    if task is None:
        print(f"\n✗ Error: Task #{task_id} not found\n")
        return

    # Confirmation prompt
    confirm = input(f"\nAre you sure you want to delete this task? (yes/no): ")

    if confirm.lower() not in ["yes", "y"]:
        print("\nDelete cancelled.\n")
        return

    # Call delete_task
    success, message = delete_task(task_id)

    # Display result
    print(f"\n{message}\n")


def handle_toggle_complete():
    """Handle toggling task completion status (US-5)."""
    print("\n--- Mark Task Complete/Incomplete ---")

    # Prompt for task ID
    task_id_input = input("Enter task ID: ")

    # Validate task ID
    is_valid, task_id, error = validate_task_id(task_id_input, tasks)
    if not is_valid:
        print(f"\n✗ Error: {error}\n")
        return

    # Call toggle_complete
    success, message = toggle_complete(task_id)

    # Display result
    print(f"\n{message}\n")


def handle_exit():
    """Handle application exit."""
    print("\nThank you for using Todo App! Goodbye.\n")


def main():
    """Main application loop."""
    while True:
        try:
            display_menu()
            choice = input("Enter your choice (1-6): ")

            if choice == "1":
                handle_add_task()
            elif choice == "2":
                handle_view_tasks()
            elif choice == "3":
                handle_update_task()
            elif choice == "4":
                handle_delete_task()
            elif choice == "5":
                handle_toggle_complete()
            elif choice == "6":
                handle_exit()
                break
            else:
                print("\n✗ Error: Invalid choice. Please select 1-6.\n")

        except KeyboardInterrupt:
            print("\n\nGoodbye!\n")
            break
        except Exception as e:
            print(f"\n✗ Error: {e}")
            print("Please try again.\n")


if __name__ == "__main__":
    main()
