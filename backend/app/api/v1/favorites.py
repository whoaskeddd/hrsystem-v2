from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.errors import ApiError
from app.db.session import get_db
from app.models import FavoriteResume, FavoriteVacancy, Resume, User, Vacancy

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("/vacancies")
def list_favorite_vacancies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.execute(
        select(Vacancy).join(FavoriteVacancy, FavoriteVacancy.vacancy_id == Vacancy.id).where(FavoriteVacancy.user_id == current_user.id)
    ).scalars().all()
    return items


@router.post("/vacancies/{vacancy_id}")
def add_favorite_vacancy(vacancy_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vacancy = db.get(Vacancy, vacancy_id)
    if not vacancy:
        raise ApiError("not_found", "Vacancy not found", status_code=404)

    exists = db.execute(
        select(FavoriteVacancy).where(FavoriteVacancy.user_id == current_user.id, FavoriteVacancy.vacancy_id == vacancy_id)
    ).scalar_one_or_none()
    if not exists:
        db.add(FavoriteVacancy(user_id=current_user.id, vacancy_id=vacancy_id))
        db.commit()
    return {"success": True}


@router.delete("/vacancies/{vacancy_id}", status_code=204)
def delete_favorite_vacancy(vacancy_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.execute(
        select(FavoriteVacancy).where(FavoriteVacancy.user_id == current_user.id, FavoriteVacancy.vacancy_id == vacancy_id)
    ).scalar_one_or_none()
    if item:
        db.delete(item)
        db.commit()


@router.get("/resumes")
def list_favorite_resumes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.execute(
        select(Resume).join(FavoriteResume, FavoriteResume.resume_id == Resume.id).where(FavoriteResume.user_id == current_user.id)
    ).scalars().all()
    return items


@router.post("/resumes/{resume_id}")
def add_favorite_resume(resume_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.get(Resume, resume_id)
    if not resume:
        raise ApiError("not_found", "Resume not found", status_code=404)

    exists = db.execute(
        select(FavoriteResume).where(FavoriteResume.user_id == current_user.id, FavoriteResume.resume_id == resume_id)
    ).scalar_one_or_none()
    if not exists:
        db.add(FavoriteResume(user_id=current_user.id, resume_id=resume_id))
        db.commit()
    return {"success": True}


@router.delete("/resumes/{resume_id}", status_code=204)
def delete_favorite_resume(resume_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.execute(
        select(FavoriteResume).where(FavoriteResume.user_id == current_user.id, FavoriteResume.resume_id == resume_id)
    ).scalar_one_or_none()
    if item:
        db.delete(item)
        db.commit()
