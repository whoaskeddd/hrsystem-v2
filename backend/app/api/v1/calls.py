from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.v1.chats import broadcast_chat_event
from app.core.errors import ApiError
from app.db.session import get_db
from app.models import CallSession, ChatParticipant, Notification, User
from app.schemas.domain import CallCreate, CallPatchStatus

router = APIRouter(prefix="/calls", tags=["calls"])


def _assert_call_access(call: CallSession | None, current_user: User) -> CallSession:
    if not call:
        raise ApiError("not_found", "Call not found", status_code=404)
    if current_user.id not in [call.initiated_by, call.participant_id]:
        raise ApiError("forbidden", "Call access denied", status_code=403)
    return call


@router.get("")
def list_calls(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.execute(
        select(CallSession)
        .where(or_(CallSession.initiated_by == current_user.id, CallSession.participant_id == current_user.id))
        .order_by(CallSession.started_at.desc())
    ).scalars().all()


@router.post("")
def create_call(payload: CallCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.participant_id == current_user.id:
        raise ApiError("invalid_request", "Cannot call yourself", status_code=400)

    peer = db.get(User, payload.participant_id)
    if not peer:
        raise ApiError("not_found", "User not found", status_code=404)

    if payload.chat_id:
        participant_ids = db.execute(
            select(ChatParticipant.user_id).where(ChatParticipant.chat_id == payload.chat_id)
        ).scalars().all()
        if current_user.id not in participant_ids or payload.participant_id not in participant_ids:
            raise ApiError("forbidden", "Call chat access denied", status_code=403)

    call = CallSession(
        chat_id=payload.chat_id,
        initiated_by=current_user.id,
        participant_id=payload.participant_id,
        status="requested",
        context=payload.context,
    )
    db.add(call)
    db.add(
        Notification(
            user_id=payload.participant_id,
            title="Incoming call",
            description=f"{current_user.full_name} started a call.",
        )
    )
    db.commit()
    db.refresh(call)
    return call


@router.get("/{call_id}")
def get_call(call_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    call = db.get(CallSession, call_id)
    return _assert_call_access(call, current_user)


@router.patch("/{call_id}/status")
async def patch_call_status(
    call_id: str,
    payload: CallPatchStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    call = _assert_call_access(db.get(CallSession, call_id), current_user)
    call.status = payload.status

    if payload.summary is not None:
        call.summary = payload.summary
    if payload.transcript is not None:
        call.transcript = payload.transcript

    if payload.status in {"ended", "rejected", "missed"} and call.ended_at is None:
        call.ended_at = datetime.now(timezone.utc)
        if call.started_at:
            call.duration_seconds = max(0, int((call.ended_at - call.started_at).total_seconds()))

    notify_user_id = call.participant_id if current_user.id == call.initiated_by else call.initiated_by
    db.add(
        Notification(
            user_id=notify_user_id,
            title="Call status updated",
            description=f"Status changed to: {call.status}.",
        )
    )
    db.commit()
    db.refresh(call)

    if call.chat_id:
        await broadcast_chat_event(
            call.chat_id,
            {
                "type": "call_status",
                "chat_id": call.chat_id,
                "call_id": call.id,
                "status": call.status,
                "ended_at": call.ended_at.isoformat() if call.ended_at else None,
            },
        )
    return call
