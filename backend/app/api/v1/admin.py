from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models import Company, Resume, User, UserRole, Vacancy
from app.schemas.admin import ReportStatusPatch

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.admin))):
    return db.execute(select(User)).scalars().all()


@router.patch("/users/{user_id}/block")
def block_user(user_id: str, db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.admin))):
    user = db.get(User, user_id)
    if user:
        user.is_blocked = True
        db.commit()
    return {"success": True}


@router.patch("/users/{user_id}/unblock")
def unblock_user(user_id: str, db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.admin))):
    user = db.get(User, user_id)
    if user:
        user.is_blocked = False
        db.commit()
    return {"success": True}


@router.get("/companies")
def admin_companies(db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.admin))):
    return db.execute(select(Company)).scalars().all()


@router.get("/vacancies")
def admin_vacancies(db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.admin))):
    return db.execute(select(Vacancy)).scalars().all()


@router.get("/resumes")
def admin_resumes(db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.admin))):
    return db.execute(select(Resume)).scalars().all()


@router.get("/reports")
def admin_reports(_: User = Depends(require_roles(UserRole.admin))):
    return [
        {"id": "report-1", "title": "Жалоба на вакансию", "status": "new"},
        {"id": "report-2", "title": "Жалоба на пользователя", "status": "in_review"},
    ]


@router.patch("/reports/{report_id}/status")
def update_report_status(report_id: str, payload: ReportStatusPatch, _: User = Depends(require_roles(UserRole.admin))):
    return {"id": report_id, "status": payload.status}


@router.get("/logs")
def admin_logs(_: User = Depends(require_roles(UserRole.admin))):
    return [
        {"id": "log-1", "event": "user.login", "level": "info"},
        {"id": "log-2", "event": "vacancy.publish", "level": "info"},
    ]
