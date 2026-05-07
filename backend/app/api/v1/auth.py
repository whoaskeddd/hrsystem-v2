import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, revoke_refresh_token, token_hash
from app.core.config import get_settings
from app.core.errors import ApiError
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.db.session import get_db
from app.models import CandidateProfile, Company, EmployerProfile, RefreshToken, User, UserRole
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])
_password_reset_tokens: dict[str, tuple[str, datetime]] = {}


def _auth_payload(user: User, access_token: str, refresh_token: str) -> dict:
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
            "role": user.role.value,
            "headline": user.headline,
            "city": user.city,
            "status": user.status,
        },
    }


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.execute(select(User).where(User.email == payload.email.lower())).scalar_one_or_none()
    if existing:
        raise ApiError("email_taken", "User with this email already exists", status_code=409)

    role = payload.role
    if role not in {UserRole.candidate, UserRole.employer}:
        raise ApiError("invalid_role", "Registration is allowed only for candidate or employer", status_code=400)

    user = User(
        full_name=payload.full_name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=role,
        headline="Новый кандидат" if role == UserRole.candidate else "Новый работодатель",
        city="Москва",
        status="Профиль заполняется" if role == UserRole.candidate else "Компания подключается",
    )
    db.add(user)
    db.flush()

    if role == UserRole.candidate:
        db.add(
            CandidateProfile(
                user_id=user.id,
                headline="Специалист",
                about="Новый профиль соискателя",
                location="Москва",
                preferred_format="Удаленно или гибрид",
                salary_expectation="По договоренности",
                experience="До 1 года",
                availability="Готов обсудить",
                skills=["Communication"],
                summary=["Профиль создан"],
            )
        )
    else:
        company = Company(owner_user_id=user.id, name=payload.company_name or "Новая компания", description="", office="Москва")
        db.add(company)
        db.flush()
        db.add(
            EmployerProfile(
                user_id=user.id,
                company_id=company.id,
                company_name=company.name,
                position="Hiring Manager",
                about_company="Компания только что подключена",
                office="Москва",
                hiring_focus=["Product", "Engineering"],
                team_size="До 50 сотрудников",
                response_rate="0%",
            )
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    settings = get_settings()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=token_hash(refresh_token),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.refresh_token_expire_minutes),
        )
    )
    db.commit()
    db.refresh(user)
    return _auth_payload(user, access_token, refresh_token)


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == payload.email.lower())).scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise ApiError("invalid_credentials", "Invalid email or password", status_code=401)
    if user.is_blocked:
        raise ApiError("forbidden", "User is blocked", status_code=403)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    settings = get_settings()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=token_hash(refresh_token),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.refresh_token_expire_minutes),
        )
    )
    db.commit()
    return _auth_payload(user, access_token, refresh_token)


@router.post("/logout")
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    revoke_refresh_token(db, payload.refresh_token)
    return {"success": True}


@router.post("/refresh")
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        decoded = decode_token(payload.refresh_token)
    except ValueError as exc:
        raise ApiError("invalid_token", "Invalid refresh token", status_code=401) from exc

    if decoded.get("type") != "refresh":
        raise ApiError("invalid_token", "Invalid refresh token type", status_code=401)

    token = db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash(payload.refresh_token))).scalar_one_or_none()
    if not token or token.revoked_at is not None or token.expires_at < datetime.now(timezone.utc):
        raise ApiError("invalid_token", "Refresh token is expired or revoked", status_code=401)

    user = db.get(User, decoded.get("sub"))
    if not user:
        raise ApiError("invalid_token", "User not found", status_code=401)

    token.revoked_at = datetime.now(timezone.utc)
    new_refresh = create_refresh_token(user.id)
    settings = get_settings()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=token_hash(new_refresh),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.refresh_token_expire_minutes),
        )
    )
    db.commit()

    return {
        "access_token": create_access_token(user.id),
        "refresh_token": new_refresh,
        "token_type": "bearer",
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == payload.email.lower())).scalar_one_or_none()
    if user:
        token = hashlib.sha256(f"{user.id}:{datetime.now(timezone.utc).isoformat()}".encode("utf-8")).hexdigest()
        _password_reset_tokens[token] = (user.id, datetime.now(timezone.utc) + timedelta(minutes=30))
    return {"success": True}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_data = _password_reset_tokens.get(payload.token)
    if not token_data:
        raise ApiError("invalid_token", "Invalid reset token", status_code=400)

    user_id, expires_at = token_data
    if expires_at < datetime.now(timezone.utc):
        _password_reset_tokens.pop(payload.token, None)
        raise ApiError("expired_token", "Reset token expired", status_code=400)

    user = db.get(User, user_id)
    if not user:
        raise ApiError("not_found", "User not found", status_code=404)

    user.password_hash = hash_password(payload.new_password)
    _password_reset_tokens.pop(payload.token, None)
    db.commit()
    return {"success": True}


@router.get("/debug/reset-token/{email}")
def debug_get_reset_token(email: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    user = db.execute(select(User).where(User.email == email.lower())).scalar_one_or_none()
    if not user:
        raise ApiError("not_found", "User not found", status_code=404)
    for token, (token_user_id, _) in _password_reset_tokens.items():
        if token_user_id == user.id:
            return {"token": token}
    raise ApiError("not_found", "No reset token issued", status_code=404)
