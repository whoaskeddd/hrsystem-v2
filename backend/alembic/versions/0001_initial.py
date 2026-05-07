"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2026-04-15

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    user_role = sa.Enum("candidate", "employer", "admin", name="userrole")
    vacancy_status = sa.Enum("draft", "published", "archived", name="vacancystatus")

    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("headline", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("city", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("status", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("is_blocked", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "candidate_profiles",
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("headline", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("about", sa.Text(), nullable=False, server_default=""),
        sa.Column("location", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("preferred_format", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("salary_expectation", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("experience", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("availability", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("skills", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("summary", sa.JSON(), nullable=False, server_default="[]"),
    )

    op.create_table(
        "companies",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("owner_user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("office", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
    )

    op.create_table(
        "employer_profiles",
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("company_id", sa.String(length=36), sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("company_name", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("position", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("about_company", sa.Text(), nullable=False, server_default=""),
        sa.Column("office", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("hiring_focus", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("team_size", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("response_rate", sa.String(length=120), nullable=False, server_default=""),
    )

    op.create_table(
        "vacancies",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("owner_user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", sa.String(length=36), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_name", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("salary", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("experience", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("location", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("format", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("employment", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("status", vacancy_status, nullable=False, server_default="draft"),
        sa.Column("note", sa.Text(), nullable=False, server_default=""),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("responsibilities", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("requirements", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("perks", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_vacancies_owner_user_id", "vacancies", ["owner_user_id"], unique=False)

    op.create_table(
        "resumes",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("candidate_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("candidate_name", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("role", sa.String(length=255), nullable=False),
        sa.Column("experience", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("salary", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("location", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("visibility", sa.String(length=120), nullable=False, server_default="public"),
        sa.Column("about", sa.Text(), nullable=False, server_default=""),
        sa.Column("skills", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("education", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("format_preference", sa.String(length=120), nullable=False, server_default=""),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_resumes_candidate_id", "resumes", ["candidate_id"], unique=False)

    op.create_table(
        "applications",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("vacancy_id", sa.String(length=36), sa.ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("candidate_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(length=120), nullable=False, server_default="submitted"),
        sa.Column("cover_letter", sa.Text(), nullable=False, server_default=""),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_applications_candidate_id", "applications", ["candidate_id"], unique=False)
    op.create_index("ix_applications_vacancy_id", "applications", ["vacancy_id"], unique=False)

    op.create_table(
        "favorite_vacancies",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("vacancy_id", sa.String(length=36), sa.ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False),
        sa.UniqueConstraint("user_id", "vacancy_id", name="uq_favorite_vacancy"),
    )
    op.create_index("ix_favorite_vacancies_user_id", "favorite_vacancies", ["user_id"], unique=False)
    op.create_index("ix_favorite_vacancies_vacancy_id", "favorite_vacancies", ["vacancy_id"], unique=False)

    op.create_table(
        "favorite_resumes",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_id", sa.String(length=36), sa.ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False),
        sa.UniqueConstraint("user_id", "resume_id", name="uq_favorite_resume"),
    )
    op.create_index("ix_favorite_resumes_user_id", "favorite_resumes", ["user_id"], unique=False)
    op.create_index("ix_favorite_resumes_resume_id", "favorite_resumes", ["resume_id"], unique=False)

    op.create_table(
        "notifications",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"], unique=False)

    op.create_table(
        "notification_settings",
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("in_app_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("email_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("push_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
    )

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"], unique=False)
    op.create_index("ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_refresh_tokens_token_hash", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_user_id", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")

    op.drop_table("notification_settings")

    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")

    op.drop_index("ix_favorite_resumes_resume_id", table_name="favorite_resumes")
    op.drop_index("ix_favorite_resumes_user_id", table_name="favorite_resumes")
    op.drop_table("favorite_resumes")

    op.drop_index("ix_favorite_vacancies_vacancy_id", table_name="favorite_vacancies")
    op.drop_index("ix_favorite_vacancies_user_id", table_name="favorite_vacancies")
    op.drop_table("favorite_vacancies")

    op.drop_index("ix_applications_vacancy_id", table_name="applications")
    op.drop_index("ix_applications_candidate_id", table_name="applications")
    op.drop_table("applications")

    op.drop_index("ix_resumes_candidate_id", table_name="resumes")
    op.drop_table("resumes")

    op.drop_index("ix_vacancies_owner_user_id", table_name="vacancies")
    op.drop_table("vacancies")

    op.drop_table("employer_profiles")
    op.drop_table("companies")
    op.drop_table("candidate_profiles")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
