import os

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./.test.db"

import httpx
import pytest

from app.core.database import Base, async_session_factory, engine as app_engine, get_db
from app.core.security import get_password_hash
from app.main import app
from app.models.admin import AdminSettings


@pytest.fixture(scope="session")
def engine():
    return app_engine


@pytest.fixture
async def db(engine):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    async with async_session_factory() as session:
        yield session


@pytest.fixture
async def client(db):
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture
async def seed_admin(db):
    db.add(
        AdminSettings(
            id=1,
            email="admin@gmail.com",
            password_hash=get_password_hash("password123"),
        )
    )
    await db.commit()


@pytest.fixture
async def admin_headers(client, seed_admin):
    response = await client.post(
        "/api/v1/admin/login",
        json={"email": "admin@gmail.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    return {"Authorization": f"Bearer {data['access_token']}"}
