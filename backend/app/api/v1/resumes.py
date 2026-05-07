from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.errors import ApiError
from app.db.session import get_db
from app.models import Resume, User, UserRole
from app.schemas.domain import ResumeCreate, ResumePatch

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get("")
def list_resumes(
    q: str | None = None,
    visibility: str | None = None,
    region: str | None = None,
    remote: bool | None = None,
    sort: str = "-updated_at",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    stmt = select(Resume)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Resume.role.ilike(like), Resume.about.ilike(like), Resume.candidate_name.ilike(like)))
    if visibility:
        stmt = stmt.where(Resume.visibility == visibility)
    if region:
        stmt = stmt.where(Resume.location.ilike(f"%{region}%"))
    if remote is True:
        stmt = stmt.where(Resume.format_preference.ilike("%удал%"))

    if sort == "updated_at":
        stmt = stmt.order_by(Resume.updated_at.asc())
    else:
        stmt = stmt.order_by(Resume.updated_at.desc())

    items = db.execute(stmt.offset((page - 1) * page_size).limit(page_size)).scalars().all()
    return items


@router.post("")
def create_resume(payload: ResumeCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.candidate))):
    resume = Resume(
        candidate_id=current_user.id,
        candidate_name=current_user.full_name,
        role=payload.role,
        experience=payload.experience,
        salary=payload.salary,
        location=payload.location,
        visibility=payload.visibility,
        about=payload.about,
        skills=payload.skills,
        education=payload.education,
        format_preference=payload.format_preference,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/{resume_id}")
def get_resume(resume_id: str, db: Session = Depends(get_db)):
    resume = db.get(Resume, resume_id)
    if not resume:
        raise ApiError("not_found", "Resume not found", status_code=404)
    return resume


@router.patch("/{resume_id}")
def patch_resume(
    resume_id: str,
    payload: ResumePatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.candidate, UserRole.admin)),
):
    resume = db.get(Resume, resume_id)
    if not resume:
        raise ApiError("not_found", "Resume not found", status_code=404)
    if current_user.role != UserRole.admin and resume.candidate_id != current_user.id:
        raise ApiError("forbidden", "Resume access denied", status_code=403)

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(resume, field, value)

    db.commit()
    db.refresh(resume)
    return resume


@router.delete("/{resume_id}", status_code=204)
def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.candidate, UserRole.admin)),
):
    resume = db.get(Resume, resume_id)
    if not resume:
        raise ApiError("not_found", "Resume not found", status_code=404)
    if current_user.role != UserRole.admin and resume.candidate_id != current_user.id:
        raise ApiError("forbidden", "Resume access denied", status_code=403)
    db.delete(resume)
    db.commit()
