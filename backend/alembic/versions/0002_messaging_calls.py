"""messaging_and_calls

Revision ID: 0002_messaging_calls
Revises: 0001_initial
Create Date: 2026-04-17
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_messaging_calls"
down_revision: Union[str, Sequence[str], None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "chats",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("vacancy_id", sa.String(length=36), sa.ForeignKey("vacancies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("application_id", sa.String(length=36), sa.ForeignKey("applications.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_by", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_chats_application_id", "chats", ["application_id"], unique=False)
    op.create_index("ix_chats_created_by", "chats", ["created_by"], unique=False)

    op.create_table(
        "chat_participants",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("chat_id", sa.String(length=36), sa.ForeignKey("chats.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("unread_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("joined_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("chat_id", "user_id", name="uq_chat_participant"),
    )
    op.create_index("ix_chat_participants_chat_id", "chat_participants", ["chat_id"], unique=False)
    op.create_index("ix_chat_participants_user_id", "chat_participants", ["user_id"], unique=False)

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("chat_id", sa.String(length=36), sa.ForeignKey("chats.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sender_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("body", sa.Text(), nullable=False, server_default=""),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="sent"),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_chat_messages_chat_id", "chat_messages", ["chat_id"], unique=False)
    op.create_index("ix_chat_messages_sender_id", "chat_messages", ["sender_id"], unique=False)

    op.create_table(
        "call_sessions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("chat_id", sa.String(length=36), sa.ForeignKey("chats.id", ondelete="SET NULL"), nullable=True),
        sa.Column("initiated_by", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("participant_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="requested"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("transcript", sa.Text(), nullable=False, server_default=""),
        sa.Column("context", sa.Text(), nullable=False, server_default=""),
    )
    op.create_index("ix_call_sessions_chat_id", "call_sessions", ["chat_id"], unique=False)
    op.create_index("ix_call_sessions_initiated_by", "call_sessions", ["initiated_by"], unique=False)
    op.create_index("ix_call_sessions_participant_id", "call_sessions", ["participant_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_call_sessions_participant_id", table_name="call_sessions")
    op.drop_index("ix_call_sessions_initiated_by", table_name="call_sessions")
    op.drop_index("ix_call_sessions_chat_id", table_name="call_sessions")
    op.drop_table("call_sessions")

    op.drop_index("ix_chat_messages_sender_id", table_name="chat_messages")
    op.drop_index("ix_chat_messages_chat_id", table_name="chat_messages")
    op.drop_table("chat_messages")

    op.drop_index("ix_chat_participants_user_id", table_name="chat_participants")
    op.drop_index("ix_chat_participants_chat_id", table_name="chat_participants")
    op.drop_table("chat_participants")

    op.drop_index("ix_chats_created_by", table_name="chats")
    op.drop_index("ix_chats_application_id", table_name="chats")
    op.drop_table("chats")
