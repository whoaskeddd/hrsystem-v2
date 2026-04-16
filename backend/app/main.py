from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.errors import ApiError, api_error_handler
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.services.seed import seed_if_empty

settings = get_settings()
app = FastAPI(title=settings.app_name, debug=settings.debug)
app.add_exception_handler(ApiError, api_error_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    # Local fallback when migrations are not applied yet.
    Base.metadata.create_all(bind=engine)
    if settings.enable_seed_data:
        with SessionLocal() as db:
            seed_if_empty(db)


@app.get("/healthz")
def healthcheck() -> dict:
    return {"status": "ok"}


@app.get("/api/v1/chats")
def chats_not_started() -> dict:
    raise ApiError("not_implemented", "Messaging milestone is not started yet", status_code=501)


@app.get("/api/v1/calls")
def calls_not_started() -> dict:
    raise ApiError("not_implemented", "Calls milestone is not started yet", status_code=501)


app.include_router(api_router, prefix=settings.api_prefix)
