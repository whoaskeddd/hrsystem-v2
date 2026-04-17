from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import (
    Application,
    CallSession,
    CandidateProfile,
    Chat,
    ChatMessage,
    ChatParticipant,
    Company,
    EmployerProfile,
    Notification,
    NotificationSettings,
    Resume,
    User,
    UserRole,
    Vacancy,
    VacancyStatus,
)


def seed_if_empty(db: Session) -> None:
    user_count = db.scalar(select(func.count(User.id))) or 0
    if user_count > 0:
        return

    candidate = User(
        full_name="Anna Smirnova",
        email="anna@hrplatform.dev",
        password_hash=hash_password("demo-password"),
        role=UserRole.candidate,
        headline="Senior Frontend Engineer",
        city="Moscow",
        status="Open to opportunities",
    )
    employer = User(
        full_name="Igor Belyaev",
        email="igor@aurumlabs.dev",
        password_hash=hash_password("demo-password"),
        role=UserRole.employer,
        headline="Head of Product Hiring",
        city="Moscow",
        status="Hiring",
    )
    admin = User(
        full_name="Maria Orlova",
        email="admin@hrplatform.dev",
        password_hash=hash_password("demo-password"),
        role=UserRole.admin,
        headline="Platform Administrator",
        city="Moscow",
        status="On duty",
    )
    db.add_all([candidate, employer, admin])
    db.flush()

    company = Company(
        owner_user_id=employer.id,
        name="Aurum Labs",
        description="HRTech platform",
        office="Moscow",
        is_verified=True,
    )
    db.add(company)
    db.flush()

    db.add(
        CandidateProfile(
            user_id=candidate.id,
            headline="Senior frontend developer",
            about="Focus on complex B2B interfaces.",
            location="Moscow",
            preferred_format="Hybrid",
            salary_expectation="250 000 RUB",
            experience="6 years",
            availability="In 2 weeks",
            skills=["React", "TypeScript"],
            summary=["Launched design system"],
        )
    )
    db.add(
        EmployerProfile(
            user_id=employer.id,
            company_id=company.id,
            company_name=company.name,
            position="Head of Hiring",
            about_company="Building an HRTech platform",
            office="Moscow",
            hiring_focus=["Frontend", "Design"],
            team_size="247 employees",
            response_rate="92%",
        )
    )

    vacancy = Vacancy(
        owner_user_id=employer.id,
        company_id=company.id,
        company_name=company.name,
        title="Senior Frontend Engineer",
        salary="280 000 RUB",
        experience="3-6 years",
        location="Moscow",
        format="Hybrid",
        employment="Full-time",
        status=VacancyStatus.published,
        note="React, TypeScript",
        description="Product role in a core team",
        responsibilities=["Develop core cabinet flows"],
        requirements=["Strong React knowledge"],
        perks=["Strong team"],
        published_at=datetime.now(timezone.utc),
    )
    db.add(vacancy)
    db.flush()

    resume = Resume(
        candidate_id=candidate.id,
        candidate_name=candidate.full_name,
        role="Senior Frontend Developer",
        experience="6 years",
        salary="250 000 RUB",
        location="Moscow",
        visibility="public",
        about="Experience in enterprise dashboards and analytics.",
        skills=["React", "TypeScript"],
        education="Bauman Moscow State Technical University",
        format_preference="Hybrid",
    )
    db.add(resume)
    db.flush()

    application = Application(
        vacancy_id=vacancy.id,
        candidate_id=candidate.id,
        status="screening",
        cover_letter="Ready to discuss the role.",
    )
    db.add(application)
    db.flush()

    chat = Chat(created_by=employer.id, vacancy_id=vacancy.id, application_id=application.id)
    db.add(chat)
    db.flush()

    db.add_all(
        [
            ChatParticipant(chat_id=chat.id, user_id=candidate.id, unread_count=1),
            ChatParticipant(chat_id=chat.id, user_id=employer.id, unread_count=0),
        ]
    )
    db.add(
        ChatMessage(
            chat_id=chat.id,
            sender_id=employer.id,
            body="Hello! When is it convenient for you to have a call?",
            status="sent",
        )
    )
    db.add(
        CallSession(
            chat_id=chat.id,
            initiated_by=employer.id,
            participant_id=candidate.id,
            status="ended",
            context="Initial screening",
            summary="Discussed stack and planned technical interview.",
            duration_seconds=1180,
            ended_at=datetime.now(timezone.utc),
        )
    )

    db.add(
        Notification(
            user_id=candidate.id,
            title="New employer response",
            description="Aurum Labs replied to your application.",
            is_read=False,
        )
    )

    db.add_all(
        [
            NotificationSettings(user_id=candidate.id, in_app_enabled=True, email_enabled=False, push_enabled=False),
            NotificationSettings(user_id=employer.id, in_app_enabled=True, email_enabled=True, push_enabled=False),
            NotificationSettings(user_id=admin.id, in_app_enabled=True, email_enabled=True, push_enabled=True),
        ]
    )

    db.commit()
