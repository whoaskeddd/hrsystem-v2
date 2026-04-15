from pydantic import BaseModel, EmailStr

from app.models import UserRole
from app.schemas.common import ORMModel


class UserOut(ORMModel):
    id: str
    full_name: str
    email: EmailStr
    role: UserRole
    headline: str
    city: str
    status: str


class UserPatch(BaseModel):
    full_name: str | None = None
    headline: str | None = None
    city: str | None = None
    status: str | None = None


class CandidateProfileOut(ORMModel):
    user_id: str
    headline: str
    about: str
    location: str
    preferred_format: str
    salary_expectation: str
    experience: str
    availability: str
    skills: list[str]
    summary: list[str]


class CandidateProfilePatch(BaseModel):
    headline: str | None = None
    about: str | None = None
    location: str | None = None
    preferred_format: str | None = None
    salary_expectation: str | None = None
    availability: str | None = None


class EmployerProfileOut(ORMModel):
    user_id: str
    company_id: str | None
    company_name: str
    position: str
    about_company: str
    office: str
    hiring_focus: list[str]
    team_size: str
    response_rate: str


class EmployerProfilePatch(BaseModel):
    company_name: str | None = None
    position: str | None = None
    about_company: str | None = None
    office: str | None = None
    team_size: str | None = None
    response_rate: str | None = None


class CompanyCreate(BaseModel):
    name: str
    description: str = ""
    office: str = ""


class CompanyPatch(BaseModel):
    name: str | None = None
    description: str | None = None
    office: str | None = None


class CompanyOut(ORMModel):
    id: str
    owner_user_id: str
    name: str
    description: str
    office: str
    is_verified: bool
