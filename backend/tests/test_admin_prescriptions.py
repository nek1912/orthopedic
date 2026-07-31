import uuid
from datetime import datetime

from sqlalchemy import select

from app.models.prescription import Prescription, PrescriptionTemplate


async def _make_appointment(client, admin_headers, requested_date="2026-08-05"):
    svc_resp = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Teeth Cleaning", "duration_minutes": 30},
    )
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test Patient",
            "email": "patient@example.com",
            "password": "password123",
        },
    )
    assert reg.status_code == 200, reg.text
    patient_headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}
    book = await client.post(
        "/api/v1/appointments",
        headers=patient_headers,
        json={"service_id": svc_resp.json()["id"], "requested_date": requested_date},
    )
    assert book.status_code == 201, book.text
    return book.json()["id"], reg.json()["patient"]["name"]


async def _accept_appointment(client, admin_headers, appointment_id, requested_date="2026-08-05"):
    response = await client.patch(
        f"/api/v1/admin/appointments/{appointment_id}/accept",
        headers=admin_headers,
        json={"date": requested_date, "start_time": "10:00", "end_time": "10:30"},
    )
    assert response.status_code == 200, response.text
    return response


async def _create_prescription(client, admin_headers, appointment_id, diagnosis):
    response = await client.post(
        "/api/v1/admin/prescriptions",
        headers=admin_headers,
        json={"appointment_id": appointment_id, "diagnosis": diagnosis},
    )
    assert response.status_code == 201, response.text
    return response.json()


async def test_list_all_prescriptions_requires_auth(client):
    response = await client.get("/api/v1/admin/prescriptions")
    assert response.status_code == 401


async def test_list_all_returns_prescriptions_with_patient_name_newest_first(
    client, admin_headers, db
):
    appt_id, patient_name = await _make_appointment(client, admin_headers)
    await _accept_appointment(client, admin_headers, appt_id)

    first = await _create_prescription(client, admin_headers, appt_id, "First")
    result = await db.execute(
        select(Prescription).where(Prescription.id == uuid.UUID(first["id"]))
    )
    older = result.scalar_one()
    older.created_at = datetime(2026, 1, 1, 9, 0, 0)
    await db.commit()

    second = await _create_prescription(client, admin_headers, appt_id, "Second")

    response = await client.get("/api/v1/admin/prescriptions", headers=admin_headers)
    assert response.status_code == 200
    items = response.json()
    assert [i["id"] for i in items] == [second["id"], first["id"]]
    assert items[0]["patient_name"] == patient_name
    assert items[1]["patient_name"] == patient_name
    assert items[0]["diagnosis"] == "Second"
    assert items[1]["diagnosis"] == "First"


async def test_get_prescriptions_by_appointment_has_patient_name(
    client, admin_headers
):
    appt_id, patient_name = await _make_appointment(client, admin_headers)
    await _accept_appointment(client, admin_headers, appt_id)
    created = await _create_prescription(client, admin_headers, appt_id, "Checkup")

    response = await client.get(
        f"/api/v1/admin/prescriptions/{appt_id}", headers=admin_headers
    )
    assert response.status_code == 200
    items = response.json()
    assert items[0]["id"] == created["id"]
    assert items[0]["patient_name"] == patient_name


async def test_get_prescriptions_invalid_uuid_404(client, admin_headers):
    response = await client.get(
        "/api/v1/admin/prescriptions/not-a-uuid", headers=admin_headers
    )
    assert response.status_code == 404


async def test_create_prescription_pending_appointment_400(client, admin_headers):
    appt_id, _ = await _make_appointment(client, admin_headers)
    response = await client.post(
        "/api/v1/admin/prescriptions",
        headers=admin_headers,
        json={"appointment_id": appt_id, "diagnosis": "X"},
    )
    assert response.status_code == 400


async def test_create_prescription_accepted_appointment_201(client, admin_headers):
    appt_id, _ = await _make_appointment(client, admin_headers)
    await _accept_appointment(client, admin_headers, appt_id)
    response = await client.post(
        "/api/v1/admin/prescriptions",
        headers=admin_headers,
        json={"appointment_id": appt_id, "diagnosis": "X"},
    )
    assert response.status_code == 201


async def test_templates_empty_list(client, admin_headers):
    response = await client.get(
        "/api/v1/admin/prescriptions/templates", headers=admin_headers
    )
    assert response.status_code == 200
    assert response.json() == []


async def test_create_template_and_list_newest_first(client, admin_headers, db):
    first = await client.post(
        "/api/v1/admin/prescriptions/templates",
        headers=admin_headers,
        json={
            "name": "Standard Antibiotics",
            "diagnosis": "Infection",
            "medicines": {"items": [{"name": "Amoxicillin", "dose": "500mg"}]},
            "notes": "Take after food",
        },
    )
    assert first.status_code == 201, first.text
    first_data = first.json()
    assert first_data["id"]
    assert first_data["name"] == "Standard Antibiotics"
    assert first_data["diagnosis"] == "Infection"
    assert first_data["medicines"] == {"items": [{"name": "Amoxicillin", "dose": "500mg"}]}
    assert first_data["notes"] == "Take after food"

    result = await db.execute(
        select(PrescriptionTemplate).where(
            PrescriptionTemplate.id == uuid.UUID(first_data["id"])
        )
    )
    older = result.scalar_one()
    older.created_at = datetime(2026, 1, 1, 9, 0, 0)
    await db.commit()

    second = await client.post(
        "/api/v1/admin/prescriptions/templates",
        headers=admin_headers,
        json={"name": "Simple Checkup"},
    )
    assert second.status_code == 201, second.text
    second_data = second.json()
    assert second_data["diagnosis"] is None
    assert second_data["medicines"] is None
    assert second_data["notes"] is None

    response = await client.get(
        "/api/v1/admin/prescriptions/templates", headers=admin_headers
    )
    assert response.status_code == 200
    items = response.json()
    assert [i["id"] for i in items] == [second_data["id"], first_data["id"]]
    assert items[1]["medicines"] == {"items": [{"name": "Amoxicillin", "dose": "500mg"}]}
    assert items[1]["notes"] == "Take after food"


async def test_create_template_empty_name_422(client, admin_headers):
    response = await client.post(
        "/api/v1/admin/prescriptions/templates",
        headers=admin_headers,
        json={"name": ""},
    )
    assert response.status_code == 422


async def test_create_template_requires_auth(client):
    response = await client.post(
        "/api/v1/admin/prescriptions/templates",
        json={"name": "X"},
    )
    assert response.status_code == 401
