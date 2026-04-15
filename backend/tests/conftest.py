import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

DB_FILE = Path(__file__).parent / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{DB_FILE}"
os.environ["SECRET_KEY"] = "test-secret"

from app.main import app  # noqa: E402


@pytest.fixture()
def client():
    if DB_FILE.exists():
        DB_FILE.unlink()
    with TestClient(app) as test_client:
        yield test_client
    if DB_FILE.exists():
        DB_FILE.unlink()
