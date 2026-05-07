from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.errors import ApiError
from app.db.session import get_db
from app.models import Application, Chat, ChatMessage, ChatParticipant, Notification, User, UserRole, Vacancy
from app.schemas.domain import ApplicationCreate, ApplicationPatchStatus

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("")
def list_applications(
    vacancy_id: str | None = None,
    status: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Application)
    if current_user.role == UserRole.candidate:
        stmt = stmt.where(Application.candidate_id == current_user.id)
    if vacancy_id:
        stmt = stmt.where(Application.vacancy_id == vacancy_id)
    if status:
        stmt = stmt.where(Application.status == status)

    items = db.execute(stmt.offset((page - 1) * page_size).limit(page_size)).scalars().all()
    return items


@router.post("")
def create_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.candidate)),
):
    vacancy = db.get(Vacancy, payload.vacancy_id)
    if not vacancy:
        raise ApiError("not_found", "Vacancy not found", status_code=404)

    exists = db.execute(
        select(Application).where(Application.vacancy_id == payload.vacancy_id, Application.candidate_id == current_user.id)
    ).scalar_one_or_none()
    if exists:
        raise ApiError("already_exists", "Application already exists", status_code=409)

    item = Application(vacancy_id=payload.vacancy_id, candidate_id=current_user.id, cover_letter=payload.cover_letter, status="submitted")
    db.add(item)
    db.flush()

    existing_chat = db.execute(select(Chat).where(Chat.application_id == item.id)).scalar_one_or_none()
    if not existing_chat:
        chat = Chat(
            created_by=current_user.id,
            vacancy_id=vacancy.id,
            application_id=item.id,
            updated_at=datetime.now(timezone.utc),
        )
        db.add(chat)
        db.flush()

        employer_id = vacancy.owner_user_id
        db.add_all(
            [
                ChatParticipant(chat_id=chat.id, user_id=current_user.id, unread_count=0),
                ChatParticipant(chat_id=chat.id, user_id=employer_id, unread_count=1),
            ]
        )

        first_message = payload.cover_letter.strip() or f"Application for vacancy: {vacancy.title}"
        db.add(
            ChatMessage(
                chat_id=chat.id,
                sender_id=current_user.id,
                body=first_message,
                status="sent",
            )
        )
        db.add(
            Notification(
                user_id=employer_id,
                title="New application",
                description=f"{current_user.full_name} applied for vacancy '{vacancy.title}'.",
            )
        )

    db.commit()
    db.refresh(item)
    return item


@router.get("/{application_id}")
def get_application(application_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(Application, application_id)
    if not item:
        raise ApiError("not_found", "Application not found", status_code=404)
    if current_user.role == UserRole.candidate and item.candidate_id != current_user.id:
        raise ApiError("forbidden", "Application access denied", status_code=403)
    return item


@router.patch("/{application_id}/status")
def patch_application_status(
    application_id: str,
    payload: ApplicationPatchStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.employer, UserRole.admin)),
):
    item = db.get(Application, application_id)
    if not item:
        raise ApiError("not_found", "Application not found", status_code=404)

    if current_user.role != UserRole.admin:
        vacancy = db.get(Vacancy, item.vacancy_id)
        if not vacancy or vacancy.owner_user_id != current_user.id:
            raise ApiError("forbidden", "Application access denied", status_code=403)

    item.status = payload.status
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{application_id}", status_code=204)
def delete_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.get(Application, application_id)
    if not item:
        raise ApiError("not_found", "Application not found", status_code=404)

    if current_user.role == UserRole.candidate and item.candidate_id != current_user.id:
        raise ApiError("forbidden", "Application access denied", status_code=403)

    if current_user.role == UserRole.employer:
        vacancy = db.get(Vacancy, item.vacancy_id)
        if not vacancy or vacancy.owner_user_id != current_user.id:
            raise ApiError("forbidden", "Application access denied", status_code=403)

    db.delete(item)
    db.commit()
