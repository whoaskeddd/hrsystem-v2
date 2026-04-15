import hashlib
from datetime import datetime, timezone

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import ApiError
from app.core.security import decode_token
from app.db.session import get_db
from app.models import RefreshToken, User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise ApiError("unauthorized", "Authorization required", status_code=401)

    try:
        payload = decode_token(credentials.credentials)
    except ValueError as exc:
        raise ApiError("unauthorized", "Invalid access token", status_code=401) from exc

    if payload.get("type") != "access":
        raise ApiError("unauthorized", "Invalid access token", status_code=401)

    user_id = payload.get("sub")
    user = db.get(User, user_id)
    if not user:
        raise ApiError("unauthorized", "User not found", status_code=401)
    if user.is_blocked:
        raise ApiError("forbidden", "User is blocked", status_code=403)
    return user


def require_roles(*allowed_roles: UserRole):
    def _checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise ApiError("forbidden", "Insufficient role", status_code=403)
        return current_user

    return _checker


def revoke_refresh_token(db: Session, raw_token: str) -> None:
    hashed = token_hash(raw_token)
    token = db.execute(select(RefreshToken).where(RefreshToken.token_hash == hashed)).scalar_one_or_none()
    if token and token.revoked_at is None:
        token.revoked_at = datetime.now(timezone.utc)
        db.commit()
