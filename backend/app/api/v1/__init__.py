from fastapi import APIRouter

from app.api.v1 import admin, applications, auth, calls, chats, favorites, notifications, resumes, users, vacancies

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(vacancies.router)
api_router.include_router(resumes.router)
api_router.include_router(applications.router)
api_router.include_router(favorites.router)
api_router.include_router(chats.router)
api_router.include_router(chats.ws_router)
api_router.include_router(calls.router)
api_router.include_router(notifications.router)
api_router.include_router(admin.router)
