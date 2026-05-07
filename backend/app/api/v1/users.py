from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.errors import ApiError
from app.db.session import get_db
from app.models import CandidateProfile, Company, EmployerProfile, User, UserRole
from app.schemas.users import (
    CandidateProfilePatch,
    CompanyCreate,
    CompanyPatch,
    EmployerProfilePatch,
    UserPatch,
)

router = APIRouter(tags=["users"])


def user_to_front(user: User) -> dict:
    return {
        "id": user.id,
        "fullName": user.full_name,
        "email": user.email,
        "role": user.role.value,
        "headline": user.headline,
        "city": user.city,
        "status": user.status,
    }


@router.get("/users/me")
def get_me(current_user: User = Depends(get_current_user)):
    return user_to_front(current_user)


@router.patch("/users/me")
def patch_me(payload: UserPatch, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return user_to_front(current_user)


@router.get("/candidate/profile")
def get_candidate_profile(current_user: User = Depends(require_roles(UserRole.candidate)), db: Session = Depends(get_db)):
    profile = db.get(CandidateProfile, current_user.id)
    if not profile:
        raise ApiError("not_found", "Candidate profile not found", status_code=404)
    return profile


@router.patch("/candidate/profile")
def patch_candidate_profile(
    payload: CandidateProfilePatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.candidate)),
):
    profile = db.get(CandidateProfile, current_user.id)
    if not profile:
        raise ApiError("not_found", "Candidate profile not found", status_code=404)

    data = payload.model_dump(exclude_none=True)
    for field, value in data.items():
        setattr(profile, field, value)

    if "headline" in data:
        current_user.headline = data["headline"]
    if "location" in data:
        current_user.city = data["location"]

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/employer/profile")
def get_employer_profile(current_user: User = Depends(require_roles(UserRole.employer)), db: Session = Depends(get_db)):
    profile = db.get(EmployerProfile, current_user.id)
    if not profile:
        raise ApiError("not_found", "Employer profile not found", status_code=404)
    return profile


@router.patch("/employer/profile")
def patch_employer_profile(
    payload: EmployerProfilePatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.employer)),
):
    profile = db.get(EmployerProfile, current_user.id)
    if not profile:
        raise ApiError("not_found", "Employer profile not found", status_code=404)

    data = payload.model_dump(exclude_none=True)
    for field, value in data.items():
        setattr(profile, field, value)

    if "position" in data:
        current_user.headline = data["position"]
    if "office" in data:
        current_user.city = data["office"]

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/companies")
def create_company(payload: CompanyCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.employer))):
    company = Company(owner_user_id=current_user.id, name=payload.name, description=payload.description, office=payload.office)
    db.add(company)

    profile = db.get(EmployerProfile, current_user.id)
    if profile:
        profile.company_id = company.id
        profile.company_name = company.name
        if payload.office:
            profile.office = payload.office

    db.commit()
    db.refresh(company)
    return company


@router.get("/companies/{company_id}")
def get_company(company_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    company = db.get(Company, company_id)
    if not company:
        raise ApiError("not_found", "Company not found", status_code=404)
    return company


@router.patch("/companies/{company_id}")
def patch_company(
    company_id: str,
    payload: CompanyPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.employer, UserRole.admin)),
):
    company = db.get(Company, company_id)
    if not company:
        raise ApiError("not_found", "Company not found", status_code=404)
    if current_user.role != UserRole.admin and company.owner_user_id != current_user.id:
        raise ApiError("forbidden", "Company access denied", status_code=403)

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)
    return company


@router.post("/companies/{company_id}/verify")
def verify_company(company_id: str, db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.admin))):
    company = db.get(Company, company_id)
    if not company:
        raise ApiError("not_found", "Company not found", status_code=404)
    company.is_verified = True
    db.commit()
    db.refresh(company)
    return company
