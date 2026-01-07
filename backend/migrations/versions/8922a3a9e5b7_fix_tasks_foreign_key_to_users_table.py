"""fix_tasks_foreign_key_to_users_table

Revision ID: 8922a3a9e5b7
Revises: 002
Create Date: 2026-01-06 17:35:16.232147

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8922a3a9e5b7'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the old foreign key constraint pointing to 'user' table
    op.drop_constraint('tasks_user_id_fkey', 'tasks', type_='foreignkey')

    # Delete tasks that reference user_ids not in the 'users' table
    op.execute("""
        DELETE FROM tasks
        WHERE user_id NOT IN (SELECT id FROM users)
    """)

    # Create new foreign key constraint pointing to 'users' table
    op.create_foreign_key(
        'tasks_user_id_fkey',
        'tasks', 'users',
        ['user_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    # Drop the new foreign key constraint
    op.drop_constraint('tasks_user_id_fkey', 'tasks', type_='foreignkey')

    # Restore the old foreign key constraint pointing to 'user' table
    op.create_foreign_key(
        'tasks_user_id_fkey',
        'tasks', 'user',
        ['user_id'], ['id'],
        ondelete='CASCADE'
    )
