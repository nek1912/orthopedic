import uuid
from datetime import datetime

from sqlalchemy import select

from app.models.activity_log import ActivityLog


async def _book_appointment(client, admin_headers, email, requested_date="2026-08-05"):
    svc_resp = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Teeth Cleaning", "duration_minutes": 30},
    )
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test Patient",
            "email": email,
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
    return book.json()["id"], patient_headers


async def _accept_appointment(client, admin_headers, appointment_id, requested_date="2026-08-05"):
    response = await client.patch(
        f"/api/v1/admin/appointments/{appointment_id}/accept",
        headers=admin_headers,
        json={"date": requested_date, "start_time": "10:00", "end_time": "10:30"},
    )
    assert response.status_code == 200, response.text
    return response


def _actions(items):
    return [i["action"] for i in items]


async def test_all_admin_endpoints_require_auth(client):
    response = await client.get("/api/v1/admin/activity")
    assert response.status_code == 401
    response = await client.get("/api/v1/admin/notifications")
    assert response.status_code == 401
    response = await client.patch(
        "/api/v1/admin/notifications/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 401
    response = await client.patch("/api/v1/admin/notifications/read-all")
    assert response.status_code == 401


async def test_empty_activity_and_notifications(client, admin_headers):
    response = await client.get("/api/v1/admin/activity", headers=admin_headers)
    assert response.status_code == 200
    assert response.json() == []
    response = await client.get("/api/v1/admin/notifications", headers=admin_headers)
    assert response.status_code == 200
    assert response.json() == []


async def test_book_creates_notification_and_activity(client, admin_headers):
    appt_id, _ = await _book_appointment(client, admin_headers, email="p1@example.com")

    notif_resp = await client.get("/api/v1/admin/notifications", headers=admin_headers)
    assert notif_resp.status_code == 200
    notifications = notif_resp.json()
    assert len(notifications) == 1
    assert notifications[0]["type"] == "request.new"
    assert notifications[0]["is_read"] is False
    assert "Test Patient" in notifications[0]["message"]
    assert "2026-08-05" in notifications[0]["message"]

    activity_resp = await client.get("/api/v1/admin/activity", headers=admin_headers)
    assert activity_resp.status_code == 200
    booked = [i for i in activity_resp.json() if i["action"] == "appointment.booked"]
    assert len(booked) == 1
    assert booked[0]["entity_id"] == appt_id


async def test_accept_logs_activity_without_extra_notification(client, admin_headers):
    appt_id, _ = await _book_appointment(client, admin_headers, email="p2@example.com")
    await _accept_appointment(client, admin_headers, appt_id)

    notif_resp = await client.get("/api/v1/admin/notifications", headers=admin_headers)
    assert len(notif_resp.json()) == 1

    activity_resp = await client.get("/api/v1/admin/activity", headers=admin_headers)
    accepted = [i for i in activity_resp.json() if i["action"] == "appointment.accepted"]
    assert len(accepted) == 1
    assert accepted[0]["entity_id"] == appt_id


async def test_complete_logs_activity(client, admin_headers):
    appt_id, _ = await _book_appointment(client, admin_headers, email="p3@example.com")
    await _accept_appointment(client, admin_headers, appt_id)
    response = await client.patch(
        f"/api/v1/admin/appointments/{appt_id}/complete", headers=admin_headers
    )
    assert response.status_code == 200

    activity_resp = await client.get("/api/v1/admin/activity", headers=admin_headers)
    completed = [i for i in activity_resp.json() if i["action"] == "appointment.completed"]
    assert len(completed) == 1
    assert completed[0]["entity_id"] == appt_id


async def test_patient_cancel_creates_cancelled_notification(client, admin_headers):
    appt_id, patient_headers = await _book_appointment(
        client, admin_headers, email="p4@example.com"
    )
    response = await client.patch(
        f"/api/v1/appointments/{appt_id}/cancel", headers=patient_headers
    )
    assert response.status_code == 200, response.text

    notif_resp = await client.get("/api/v1/admin/notifications", headers=admin_headers)
    cancelled = [n for n in notif_resp.json() if n["type"] == "appointment.cancelled"]
    assert len(cancelled) == 1
    assert "Test Patient" in cancelled[0]["message"]

    activity_resp = await client.get("/api/v1/admin/activity", headers=admin_headers)
    logged = [i for i in activity_resp.json() if i["action"] == "appointment.cancelled"]
    assert len(logged) == 1
    assert logged[0]["entity_id"] == appt_id


async def test_service_create_and_toggle_logged(client, admin_headers):
    created = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Braces", "duration_minutes": 45},
    )
    assert created.status_code == 201
    service_id = created.json()["id"]

    response = await client.get("/api/v1/admin/activity", headers=admin_headers)
    created_entries = [i for i in response.json() if i["action"] == "service.created"]
    assert len(created_entries) == 1
    assert created_entries[0]["entity_id"] == service_id
    assert created_entries[0]["detail"] == "Braces"

    toggled = await client.patch(
        f"/api/v1/admin/services/{service_id}/active",
        headers=admin_headers,
        json={"active": False},
    )
    assert toggled.status_code == 200

    response = await client.get("/api/v1/admin/activity", headers=admin_headers)
    deactivated = [i for i in response.json() if i["action"] == "service.deactivated"]
    assert len(deactivated) == 1
    assert deactivated[0]["entity_id"] == service_id


async def test_activity_ordered_newest_first(client, admin_headers, db):
    first_id, _ = await _book_appointment(
        client, admin_headers, email="p5@example.com", requested_date="2026-08-05"
    )
    result = await db.execute(
        select(ActivityLog).where(ActivityLog.action == "appointment.booked")
    )
    older = result.scalars().first()
    older.created_at = datetime(2026, 1, 1, 9, 0, 0)
    await db.commit()

    second_id, _ = await _book_appointment(
        client, admin_headers, email="p6@example.com", requested_date="2026-08-06"
    )

    response = await client.get("/api/v1/admin/activity", headers=admin_headers)
    booked = [i for i in response.json() if i["action"] == "appointment.booked"]
    assert [i["entity_id"] for i in booked] == [second_id, first_id]


async def test_mark_read_and_read_all(client, admin_headers):
    appt_id, _ = await _book_appointment(client, admin_headers, email="p7@example.com")

    notif_resp = await client.get("/api/v1/admin/notifications", headers=admin_headers)
    first_id = notif_resp.json()[0]["id"]

    marked = await client.patch(
        f"/api/v1/admin/notifications/{first_id}", headers=admin_headers
    )
    assert marked.status_code == 200
    assert marked.json()["is_read"] is True

    await _book_appointment(client, admin_headers, email="p8@example.com", requested_date="2026-08-07")

    read_all = await client.patch(
        "/api/v1/admin/notifications/read-all", headers=admin_headers
    )
    assert read_all.status_code == 200
    assert read_all.json() == {"message": "All notifications marked read"}

    notif_resp = await client.get("/api/v1/admin/notifications", headers=admin_headers)
    assert len(notif_resp.json()) == 2
    assert all(n["is_read"] is True for n in notif_resp.json())


async def test_mark_read_invalid_uuid_404(client, admin_headers):
    response = await client.patch(
        "/api/v1/admin/notifications/not-a-uuid", headers=admin_headers
    )
    assert response.status_code == 404


async def test_mark_read_unknown_uuid_404(client, admin_headers):
    response = await client.patch(
        f"/api/v1/admin/notifications/{uuid.uuid4()}", headers=admin_headers
    )
    assert response.status_code == 404
