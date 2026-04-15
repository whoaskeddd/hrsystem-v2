from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.errors import ApiError
from app.db.session import get_db
from app.models import User, UserRole, Vacancy, VacancyStatus
from app.schemas.domain import VacancyCreate, VacancyPatch

router = APIRouter(prefix="/vacancies", tags=["vacancies"])


@router.get("")
def list_vacancies(
    q: str | None = None,
    region: str | None = None,
    experience: str | None = None,
    employment: str | None = None,
    remote: bool | None = None,
    sort: str = "-created_at",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    stmt = select(Vacancy)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Vacancy.title.ilike(like), Vacancy.description.ilike(like), Vacancy.note.ilike(like)))
    if region:
        stmt = stmt.where(Vacancy.location.ilike(f"%{region}%"))
    if experience:
        stmt = stmt.where(Vacancy.experience == experience)
    if employment:
        stmt = stmt.where(Vacancy.employment == employment)
    if remote is True:
        stmt = stmt.where(or_(Vacancy.format.ilike("%remote%"), Vacancy.format.ilike("%удал%")))

    if sort == "salary":
        stmt = stmt.order_by(Vacancy.salary.asc())
    elif sort == "-salary":
        stmt = stmt.order_by(Vacancy.salary.desc())
    elif sort == "created_at":
        stmt = stmt.order_by(Vacancy.created_at.asc())
    else:
        stmt = stmt.order_by(Vacancy.created_at.desc())

    items = db.execute(stmt.offset((page - 1) * page_size).limit(page_size)).scalars().all()
    return items


@router.post("")
def create_vacancy(payload: VacancyCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.employer, UserRole.admin))):
    vacancy = Vacancy(
        owner_user_id=current_user.id,
        company_id=payload.company_id,
        company_name="",
        title=payload.title,
        salary=payload.salary,
        experience=payload.experience,
        location=payload.location,
        format=payload.format,
        employment=payload.employment,
        note=payload.note,
        description=payload.description,
        responsibilities=payload.responsibilities,
        requirements=payload.requirements,
        perks=payload.perks,
    )
    db.add(vacancy)
    db.commit()
    db.refresh(vacancy)
    return vacancy


@router.get("/{vacancy_id}")
def get_vacancy(vacancy_id: str, db: Session = Depends(get_db)):
    vacancy = db.get(Vacancy, vacancy_id)
    if not vacancy:
        raise ApiError("not_found", "Vacancy not found", status_code=404)
    return vacancy


@router.patch("/{vacancy_id}")
def patch_vacancy(
    vacancy_id: str,
    payload: VacancyPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.employer, UserRole.admin)),
):
    vacancy = db.get(Vacancy, vacancy_id)
    if not vacancy:
        raise ApiError("not_found", "Vacancy not found", status_code=404)

    if current_user.role != UserRole.admin and vacancy.owner_user_id != current_user.id:
        raise ApiError("forbidden", "Vacancy access denied", status_code=403)

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(vacancy, field, value)

    db.commit()
    db.refresh(vacancy)
    return vacancy


@router.delete("/{vacancy_id}", status_code=204)
def delete_vacancy(
    vacancy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.employer, UserRole.admin)),
):
    vacancy = db.get(Vacancy, vacancy_id)
    if not vacancy:
        raise ApiError("not_found", "Vacancy not found", status_code=404)
    if current_user.role != UserRole.admin and vacancy.owner_user_id != current_user.id:
        raise ApiError("forbidden", "Vacancy access denied", status_code=403)

    db.delete(vacancy)
    db.commit()


@router.post("/{vacancy_id}/publish")
def publish_vacancy(
    vacancy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.employer, UserRole.admin)),
):
    vacancy = db.get(Vacancy, vacancy_id)
    if not vacancy:
        raise ApiError("not_found", "Vacancy not found", status_code=404)
    if current_user.role != UserRole.admin and vacancy.owner_user_id != current_user.id:
        raise ApiError("forbidden", "Vacancy access denied", status_code=403)

    vacancy.status = VacancyStatus.published
    vacancy.published_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(vacancy)
    return vacancy


@router.post("/{vacancy_id}/archive")
def archive_vacancy(
    vacancy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.employer, UserRole.admin)),
):
    vacancy = db.get(Vacancy, vacancy_id)
    if not vacancy:
        raise ApiError("not_found", "Vacancy not found", status_code=404)
    if current_user.role != UserRole.admin and vacancy.owner_user_id != current_user.id:
        raise ApiError("forbidden", "Vacancy access denied", status_code=403)

    vacancy.status = VacancyStatus.archived
    db.commit()
    db.refresh(vacancy)
    return vacancy
