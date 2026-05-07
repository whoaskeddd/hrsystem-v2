from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Notification, NotificationSettings, User
from app.schemas.domain import NotificationSettingsPatch

router = APIRouter(tags=["notifications"])


@router.get("/notifications")
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.execute(select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc())).scalars().all()
    return items


@router.post("/notifications/read-all")
def read_all_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.execute(select(Notification).where(Notification.user_id == current_user.id, Notification.is_read.is_(False))).scalars().all()
    for item in items:
        item.is_read = True
    db.commit()
    return {"success": True}


@router.post("/notifications/{notification_id}/read")
def read_notification(notification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(Notification, notification_id)
    if item and item.user_id == current_user.id:
        item.is_read = True
        db.commit()
    return {"success": True}


@router.get("/notification-settings")
def get_notification_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.get(NotificationSettings, current_user.id)
    if not settings:
        settings = NotificationSettings(user_id=current_user.id, in_app_enabled=True, email_enabled=False, push_enabled=False)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.patch("/notification-settings")
def patch_notification_settings(
    payload: NotificationSettingsPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = db.get(NotificationSettings, current_user.id)
    if not settings:
        settings = NotificationSettings(user_id=current_user.id, in_app_enabled=True, email_enabled=False, push_enabled=False)
        db.add(settings)

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings
