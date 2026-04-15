from datetime import datetime

from pydantic import BaseModel

from app.models import VacancyStatus
from app.schemas.common import ORMModel


class VacancyCreate(BaseModel):
    title: str
    company_id: str
    salary: str = ""
    experience: str = ""
    location: str = ""
    format: str = ""
    employment: str = ""
    note: str = ""
    description: str = ""
    responsibilities: list[str] = []
    requirements: list[str] = []
    perks: list[str] = []


class VacancyPatch(BaseModel):
    title: str | None = None
    salary: str | None = None
    experience: str | None = None
    location: str | None = None
    format: str | None = None
    employment: str | None = None
    note: str | None = None
    description: str | None = None
    responsibilities: list[str] | None = None
    requirements: list[str] | None = None
    perks: list[str] | None = None


class VacancyOut(ORMModel):
    id: str
    title: str
    company_id: str
    company_name: str
    salary: str
    experience: str
    location: str
    format: str
    employment: str
    status: VacancyStatus
    note: str
    description: str
    responsibilities: list[str]
    requirements: list[str]
    perks: list[str]
    published_at: datetime | None


class ResumeCreate(BaseModel):
    role: str
    experience: str = ""
    salary: str = ""
    location: str = ""
    visibility: str = "public"
    about: str = ""
    skills: list[str] = []
    education: str = ""
    format_preference: str = ""


class ResumePatch(BaseModel):
    role: str | None = None
    experience: str | None = None
    salary: str | None = None
    location: str | None = None
    visibility: str | None = None
    about: str | None = None
    skills: list[str] | None = None
    education: str | None = None
    format_preference: str | None = None


class ResumeOut(ORMModel):
    id: str
    candidate_id: str
    candidate_name: str
    role: str
    experience: str
    salary: str
    location: str
    visibility: str
    about: str
    skills: list[str]
    education: str
    format_preference: str
    updated_at: datetime


class ApplicationCreate(BaseModel):
    vacancy_id: str
    cover_letter: str = ""


class ApplicationPatchStatus(BaseModel):
    status: str


class ApplicationOut(ORMModel):
    id: str
    vacancy_id: str
    candidate_id: str
    status: str
    cover_letter: str
    updated_at: datetime


class NotificationOut(ORMModel):
    id: str
    title: str
    description: str
    is_read: bool


class NotificationSettingsOut(ORMModel):
    in_app_enabled: bool
    email_enabled: bool
    push_enabled: bool


class NotificationSettingsPatch(BaseModel):
    in_app_enabled: bool | None = None
    email_enabled: bool | None = None
    push_enabled: bool | None = None


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict
