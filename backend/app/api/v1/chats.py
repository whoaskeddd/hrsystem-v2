import asyncio
import json
from collections import defaultdict
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.errors import ApiError
from app.core.security import decode_token
from app.db.session import SessionLocal, get_db
from app.models import Application, Chat, ChatMessage, ChatParticipant, Notification, User, Vacancy
from app.schemas.domain import ChatCreate, ChatMessageCreate

router = APIRouter(prefix="/chats", tags=["chats"])
ws_router = APIRouter(tags=["chats"])


class ChatHub:
    def __init__(self) -> None:
        self._rooms: dict[str, set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def connect(self, chat_id: str, socket: WebSocket) -> None:
        await socket.accept()
        async with self._lock:
            self._rooms[chat_id].add(socket)

    async def disconnect(self, chat_id: str, socket: WebSocket) -> None:
        async with self._lock:
            connections = self._rooms.get(chat_id)
            if not connections:
                return
            connections.discard(socket)
            if not connections:
                self._rooms.pop(chat_id, None)

    async def broadcast(self, chat_id: str, payload: dict) -> None:
        async with self._lock:
            connections = list(self._rooms.get(chat_id, []))

        if not connections:
            return

        for socket in connections:
            try:
                await socket.send_json(payload)
            except Exception:
                await self.disconnect(chat_id, socket)


chat_hub = ChatHub()


def _participant_ids(db: Session, chat_id: str) -> list[str]:
    return db.execute(select(ChatParticipant.user_id).where(ChatParticipant.chat_id == chat_id)).scalars().all()


def _assert_chat_access(db: Session, chat_id: str, user_id: str) -> Chat:
    chat = db.get(Chat, chat_id)
    if not chat:
        raise ApiError("not_found", "Chat not found", status_code=404)

    participant = db.execute(
        select(ChatParticipant).where(ChatParticipant.chat_id == chat_id, ChatParticipant.user_id == user_id)
    ).scalar_one_or_none()
    if not participant:
        raise ApiError("forbidden", "Chat access denied", status_code=403)
    return chat


def _serialize_chat(db: Session, chat: Chat, current_user_id: str) -> dict:
    participants = db.execute(select(ChatParticipant).where(ChatParticipant.chat_id == chat.id)).scalars().all()
    user_ids = [item.user_id for item in participants]
    users = db.execute(select(User).where(User.id.in_(user_ids))).scalars().all() if user_ids else []
    names = {user.id: user.full_name for user in users}

    last_message = db.execute(
        select(ChatMessage).where(ChatMessage.chat_id == chat.id).order_by(ChatMessage.sent_at.desc()).limit(1)
    ).scalar_one_or_none()

    current_participant = next((item for item in participants if item.user_id == current_user_id), None)
    peer_id = next((item.user_id for item in participants if item.user_id != current_user_id), "")
    vacancy = db.get(Vacancy, chat.vacancy_id) if chat.vacancy_id else None
    application = db.get(Application, chat.application_id) if chat.application_id else None

    return {
        "id": chat.id,
        "vacancy_id": chat.vacancy_id,
        "application_id": chat.application_id,
        "created_by": chat.created_by,
        "created_at": chat.created_at,
        "updated_at": chat.updated_at,
        "participant_ids": user_ids,
        "participant_names": names,
        "peer_id": peer_id,
        "peer_name": names.get(peer_id, ""),
        "unread_count": current_participant.unread_count if current_participant else 0,
        "last_message_text": last_message.body if last_message else "",
        "last_message_at": last_message.sent_at if last_message else None,
        "vacancy_title": vacancy.title if vacancy else "",
        "company_name": vacancy.company_name if vacancy else "",
        "application_status": application.status if application else "",
        "candidate_id": application.candidate_id if application else "",
        "candidate_name": names.get(application.candidate_id, "") if application else "",
        "employer_id": vacancy.owner_user_id if vacancy else "",
        "employer_name": names.get(vacancy.owner_user_id, "") if vacancy else "",
    }


async def broadcast_chat_event(chat_id: str, payload: dict) -> None:
    await chat_hub.broadcast(chat_id, payload)


@router.get("")
def list_chats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat_ids = db.execute(select(ChatParticipant.chat_id).where(ChatParticipant.user_id == current_user.id)).scalars().all()
    if not chat_ids:
        return []
    chats = db.execute(select(Chat).where(Chat.id.in_(chat_ids)).order_by(Chat.updated_at.desc())).scalars().all()
    return [_serialize_chat(db, chat, current_user.id) for chat in chats]


@router.post("")
def create_chat(payload: ChatCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.peer_user_id == current_user.id:
        raise ApiError("invalid_request", "Cannot create chat with yourself", status_code=400)

    peer = db.get(User, payload.peer_user_id)
    if not peer:
        raise ApiError("not_found", "Peer user not found", status_code=404)

    participant_chat_ids = db.execute(
        select(ChatParticipant.chat_id).where(ChatParticipant.user_id.in_([current_user.id, payload.peer_user_id]))
    ).scalars().all()

    existing_chats = []
    if participant_chat_ids:
        existing_chats = db.execute(select(Chat).where(Chat.id.in_(participant_chat_ids))).scalars().all()

    for chat in existing_chats:
        participant_ids = set(_participant_ids(db, chat.id))
        if participant_ids != {current_user.id, payload.peer_user_id}:
            continue
        if payload.application_id and chat.application_id != payload.application_id:
            continue
        if payload.vacancy_id and chat.vacancy_id != payload.vacancy_id:
            continue
        return _serialize_chat(db, chat, current_user.id)

    chat = Chat(
        created_by=current_user.id,
        vacancy_id=payload.vacancy_id,
        application_id=payload.application_id,
    )
    db.add(chat)
    db.flush()
    db.add_all(
        [
            ChatParticipant(chat_id=chat.id, user_id=current_user.id, unread_count=0),
            ChatParticipant(chat_id=chat.id, user_id=payload.peer_user_id, unread_count=0),
        ]
    )
    db.commit()
    db.refresh(chat)
    return _serialize_chat(db, chat, current_user.id)


@router.get("/{chat_id}")
def get_chat(chat_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = _assert_chat_access(db, chat_id, current_user.id)
    return _serialize_chat(db, chat, current_user.id)


@router.get("/{chat_id}/messages")
def list_messages(
    chat_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _assert_chat_access(db, chat_id, current_user.id)
    items = db.execute(
        select(ChatMessage)
        .where(ChatMessage.chat_id == chat_id)
        .order_by(ChatMessage.sent_at.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).scalars().all()
    return items


@router.post("/{chat_id}/messages")
async def create_message(
    chat_id: str,
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = _assert_chat_access(db, chat_id, current_user.id)
    body = payload.body.strip()
    if not body:
        raise ApiError("invalid_request", "Message body cannot be empty", status_code=400)

    message = ChatMessage(chat_id=chat_id, sender_id=current_user.id, body=body, status="sent")
    chat.updated_at = datetime.now(timezone.utc)
    db.add(message)

    participants = db.execute(select(ChatParticipant).where(ChatParticipant.chat_id == chat_id)).scalars().all()
    for participant in participants:
        if participant.user_id == current_user.id:
            continue
        participant.unread_count += 1
        db.add(
            Notification(
                user_id=participant.user_id,
                title="New message",
                description=f"{current_user.full_name}: {body[:160]}",
            )
        )

    db.commit()
    db.refresh(message)

    await broadcast_chat_event(
        chat_id,
        {
            "type": "message_created",
            "chat_id": chat_id,
            "message": {
                "id": message.id,
                "chat_id": message.chat_id,
                "sender_id": message.sender_id,
                "body": message.body,
                "status": message.status,
                "sent_at": message.sent_at.isoformat() if message.sent_at else None,
                "read_at": message.read_at.isoformat() if message.read_at else None,
            },
        },
    )
    return message


@router.post("/{chat_id}/read")
async def mark_chat_read(chat_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _assert_chat_access(db, chat_id, current_user.id)

    participant = db.execute(
        select(ChatParticipant).where(ChatParticipant.chat_id == chat_id, ChatParticipant.user_id == current_user.id)
    ).scalar_one_or_none()
    if participant:
        participant.unread_count = 0

    unread_messages = db.execute(
        select(ChatMessage).where(
            ChatMessage.chat_id == chat_id,
            ChatMessage.sender_id != current_user.id,
            ChatMessage.read_at.is_(None),
        )
    ).scalars().all()
    now = datetime.now(timezone.utc)
    for message in unread_messages:
        message.read_at = now
        message.status = "read"

    db.commit()

    await broadcast_chat_event(
        chat_id,
        {
            "type": "chat_read",
            "chat_id": chat_id,
            "user_id": current_user.id,
        },
    )
    return {"success": True}


def _user_from_ws_token(db: Session, token: str | None) -> User | None:
    if not token:
        return None
    try:
        payload = decode_token(token)
    except ValueError:
        return None

    if payload.get("type") != "access":
        return None

    user_id = payload.get("sub")
    user = db.get(User, user_id)
    if not user or user.is_blocked:
        return None
    return user


@ws_router.websocket("/ws/chats/{chat_id}")
async def chat_socket(websocket: WebSocket, chat_id: str, token: str | None = Query(default=None)):
    with SessionLocal() as db:
        user = _user_from_ws_token(db, token)
        if not user:
            await websocket.close(code=4401)
            return

        participant = db.execute(
            select(ChatParticipant).where(ChatParticipant.chat_id == chat_id, ChatParticipant.user_id == user.id)
        ).scalar_one_or_none()
        if not participant:
            await websocket.close(code=4403)
            return

    await chat_hub.connect(chat_id, websocket)
    try:
        while True:
            message = await websocket.receive_text()
            if message == "ping":
                await websocket.send_text("pong")
                continue

            try:
                payload = json.loads(message)
            except json.JSONDecodeError:
                continue

            if payload.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
                continue

    except WebSocketDisconnect:
        await chat_hub.disconnect(chat_id, websocket)
