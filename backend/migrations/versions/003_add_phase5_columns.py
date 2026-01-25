"""Add Phase 5 columns to tasks table

Revision ID: 003_phase5
Revises: 8922a3a9e5b7
Create Date: 2026-01-25

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_phase5'
down_revision = '8922a3a9e5b7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add Phase 5 columns to tasks table
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('reminder_minutes', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column('priority', sa.String(length=20), nullable=True, server_default='none'))
    op.add_column('tasks', sa.Column('is_recurring', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('tasks', sa.Column('recurrence_pattern', sa.String(length=20), nullable=True))
    op.add_column('tasks', sa.Column('recurrence_interval', sa.Integer(), nullable=True, server_default='1'))
    op.add_column('tasks', sa.Column('recurrence_end_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('parent_task_id', sa.Integer(), nullable=True))

    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('color', sa.String(length=7), nullable=True, server_default='#3B82F6'),
        sa.UniqueConstraint('user_id', 'name', name='uq_user_tag_name')
    )
    op.create_index('ix_tags_user_id', 'tags', ['user_id'])

    # Create task_tags junction table
    op.create_table(
        'task_tags',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('task_id', sa.Integer(), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('tag_id', sa.Integer(), sa.ForeignKey('tags.id', ondelete='CASCADE'), nullable=False),
        sa.UniqueConstraint('task_id', 'tag_id', name='uq_task_tag')
    )

    # Create reminders table
    op.create_table(
        'reminders',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('task_id', sa.Integer(), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('remind_at', sa.DateTime(), nullable=False),
        sa.Column('sent', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )
    op.create_index('ix_reminders_task_id', 'reminders', ['task_id'])
    op.create_index('ix_reminders_remind_at', 'reminders', ['remind_at'])


def downgrade() -> None:
    # Drop tables
    op.drop_table('reminders')
    op.drop_table('task_tags')
    op.drop_table('tags')

    # Drop columns from tasks
    op.drop_column('tasks', 'parent_task_id')
    op.drop_column('tasks', 'recurrence_end_date')
    op.drop_column('tasks', 'recurrence_interval')
    op.drop_column('tasks', 'recurrence_pattern')
    op.drop_column('tasks', 'is_recurring')
    op.drop_column('tasks', 'priority')
    op.drop_column('tasks', 'reminder_minutes')
    op.drop_column('tasks', 'due_date')
