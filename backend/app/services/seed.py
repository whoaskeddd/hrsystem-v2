from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import (
    Application,
    CandidateProfile,
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
        full_name="Анна Смирнова",
        email="anna@hrplatform.dev",
        password_hash=hash_password("demo-password"),
        role=UserRole.candidate,
        headline="Senior Frontend Engineer",
        city="Москва",
        status="Открыта к предложениям",
    )
    employer = User(
        full_name="Игорь Беляев",
        email="igor@aurumlabs.dev",
        password_hash=hash_password("demo-password"),
        role=UserRole.employer,
        headline="Head of Product Hiring",
        city="Москва",
        status="Нанимает",
    )
    admin = User(
        full_name="Мария Орлова",
        email="admin@hrplatform.dev",
        password_hash=hash_password("demo-password"),
        role=UserRole.admin,
        headline="Platform Administrator",
        city="Москва",
        status="На смене",
    )
    db.add_all([candidate, employer, admin])
    db.flush()

    company = Company(owner_user_id=employer.id, name="Aurum Labs", description="HRTech платформа", office="Москва", is_verified=True)
    db.add(company)
    db.flush()

    db.add(
        CandidateProfile(
            user_id=candidate.id,
            headline="Старший frontend-разработчик",
            about="Фокус на сложных B2B интерфейсах.",
            location="Москва",
            preferred_format="Гибрид",
            salary_expectation="250 000 ₽",
            experience="6 лет",
            availability="Через 2 недели",
            skills=["React", "TypeScript"],
            summary=["Запуск design system"],
        )
    )
    db.add(
        EmployerProfile(
            user_id=employer.id,
            company_id=company.id,
            company_name=company.name,
            position="Руководитель найма",
            about_company="Строим HRTech платформу",
            office="Москва",
            hiring_focus=["Frontend", "Design"],
            team_size="247 сотрудников",
            response_rate="92%",
        )
    )

    vacancy = Vacancy(
        owner_user_id=employer.id,
        company_id=company.id,
        company_name=company.name,
        title="Старший frontend-инженер",
        salary="280 000 ₽",
        experience="3-6 лет",
        location="Москва",
        format="Гибрид",
        employment="Полная занятость",
        status=VacancyStatus.published,
        note="React, TypeScript",
        description="Роль в продуктовой команде",
        responsibilities=["Развивать кабинеты"],
        requirements=["Уверенный React"],
        perks=["Сильная команда"],
        published_at=datetime.now(timezone.utc),
    )
    db.add(vacancy)
    db.flush()

    resume = Resume(
        candidate_id=candidate.id,
        candidate_name=candidate.full_name,
        role="Старший frontend-разработчик",
        experience="6 лет опыта",
        salary="250 000 ₽",
        location="Москва",
        visibility="public",
        about="Опыт в кабинетах и аналитике",
        skills=["React", "TypeScript"],
        education="МГТУ им. Баумана",
        format_preference="Гибрид",
    )
    db.add(resume)
    db.flush()

    db.add(
        Application(
            vacancy_id=vacancy.id,
            candidate_id=candidate.id,
            status="Первичный скрининг",
            cover_letter="Готова обсудить роль",
        )
    )

    db.add(
        Notification(
            user_id=candidate.id,
            title="Новый ответ от работодателя",
            description="Aurum Labs ответили по вакансии",
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
