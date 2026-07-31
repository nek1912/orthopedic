from sqlalchemy import select

from app.models.service import Service


async def test_patient_list_services_includes_new_fields(client, admin_headers):
    await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Patient Visible", "duration_minutes": 30},
    )
    response = await client.get("/api/v1/services")
    assert response.status_code == 200
    service = next(s for s in response.json() if s["name"] == "Patient Visible")
    assert service["duration_minutes"] == 30
    assert service["default_fee"] == 0.0
    assert service["requires_followup"] is False


async def test_list_services_requires_auth(client):
    response = await client.get("/api/v1/admin/services")
    assert response.status_code == 401


async def test_create_service_requires_auth(client):
    response = await client.post(
        "/api/v1/admin/services", json={"name": "X", "duration_minutes": 30}
    )
    assert response.status_code == 401


async def test_patch_service_requires_auth(client):
    response = await client.patch(
        "/api/v1/admin/services/00000000-0000-0000-0000-000000000000",
        json={"name": "X"},
    )
    assert response.status_code == 401


async def test_toggle_active_requires_auth(client):
    response = await client.patch(
        "/api/v1/admin/services/00000000-0000-0000-0000-000000000000/active",
        json={"active": False},
    )
    assert response.status_code == 401


async def test_create_service(client, admin_headers):
    response = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={
            "name": "Teeth Cleaning",
            "description": "Deep cleaning",
            "duration_minutes": 45,
            "default_fee": 1500.0,
            "preparation_notes": "Avoid eating 30 min after",
            "requires_followup": True,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"]
    assert data["name"] == "Teeth Cleaning"
    assert data["description"] == "Deep cleaning"
    assert data["duration_minutes"] == 45
    assert data["default_fee"] == 1500.0
    assert data["preparation_notes"] == "Avoid eating 30 min after"
    assert data["requires_followup"] is True
    assert data["is_active"] is True


async def test_create_service_defaults(client, admin_headers):
    response = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Checkup", "duration_minutes": 30},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["default_fee"] == 0.0
    assert data["preparation_notes"] is None
    assert data["requires_followup"] is False
    assert data["is_active"] is True


async def test_create_service_validation(client, admin_headers):
    empty_name = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "", "duration_minutes": 30},
    )
    assert empty_name.status_code == 422
    zero_duration = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "X", "duration_minutes": 0},
    )
    assert zero_duration.status_code == 422


async def test_list_services_includes_created(client, admin_headers):
    await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Root Canal", "duration_minutes": 60},
    )
    response = await client.get("/api/v1/admin/services", headers=admin_headers)
    assert response.status_code == 200
    assert any(s["name"] == "Root Canal" for s in response.json())


async def test_patch_service_updates_only_provided_fields(client, admin_headers):
    created = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Filling", "duration_minutes": 30, "default_fee": 800.0},
    )
    service_id = created.json()["id"]
    response = await client.patch(
        f"/api/v1/admin/services/{service_id}",
        headers=admin_headers,
        json={"name": "White Filling", "description": "Composite filling"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "White Filling"
    assert data["description"] == "Composite filling"
    assert data["duration_minutes"] == 30
    assert data["default_fee"] == 800.0


async def test_patch_service_active_toggle(client, admin_headers):
    created = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Whitening", "duration_minutes": 60},
    )
    service_id = created.json()["id"]
    response = await client.patch(
        f"/api/v1/admin/services/{service_id}/active",
        headers=admin_headers,
        json={"active": False},
    )
    assert response.status_code == 200
    assert response.json()["is_active"] is False


async def test_list_services_includes_inactive(client, admin_headers):
    created = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Old Service", "duration_minutes": 30},
    )
    service_id = created.json()["id"]
    await client.patch(
        f"/api/v1/admin/services/{service_id}/active",
        headers=admin_headers,
        json={"active": False},
    )
    response = await client.get("/api/v1/admin/services", headers=admin_headers)
    assert any(
        s["name"] == "Old Service" and s["is_active"] is False
        for s in response.json()
    )


async def test_patch_service_unknown_uuid_404(client, admin_headers):
    response = await client.patch(
        "/api/v1/admin/services/00000000-0000-0000-0000-000000000000",
        headers=admin_headers,
        json={"name": "X"},
    )
    assert response.status_code == 404


async def test_patch_service_invalid_uuid_404(client, admin_headers):
    response = await client.patch(
        "/api/v1/admin/services/not-a-uuid",
        headers=admin_headers,
        json={"name": "X"},
    )
    assert response.status_code == 404


async def test_created_service_visible_in_db_session(client, admin_headers, db):
    await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Implant", "duration_minutes": 90},
    )
    result = await db.execute(select(Service).where(Service.name == "Implant"))
    service = result.scalar_one()
    assert service.duration_minutes == 90
    assert service.requires_followup is False
