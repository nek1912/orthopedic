import uuid

import pytest

pytestmark = pytest.mark.asyncio

_email_counter = 0

DATE_1 = "2026-08-05"
DATE_2 = "2026-08-06"
DATE_3 = "2026-08-07"
DATE_4 = "2026-08-08"


def _unique_email():
    global _email_counter
    _email_counter += 1
    return f"patient{_email_counter}@example.com"


async def _register_patient(client, name="Test Patient"):
    response = await client.post(
        "/api/v1/auth/register",
        json={"name": name, "email": _unique_email(), "password": "password123"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    return data["patient"], {"Authorization": f"Bearer {data['access_token']}"}


async def _create_service(client, admin_headers):
    response = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Teeth Cleaning", "duration_minutes": 30},
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def _book_appointment(client, patient_headers, service_id, requested_date):
    response = await client.post(
        "/api/v1/appointments",
        headers=patient_headers,
        json={"service_id": service_id, "requested_date": requested_date},
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def _accept_appointment(client, admin_headers, appointment_id, requested_date):
    response = await client.patch(
        f"/api/v1/admin/appointments/{appointment_id}/accept",
        headers=admin_headers,
        json={"date": requested_date, "start_time": "10:00", "end_time": "10:30"},
    )
    assert response.status_code == 200, response.text


async def _complete_appointment(client, admin_headers, appointment_id):
    response = await client.patch(
        f"/api/v1/admin/appointments/{appointment_id}/complete",
        headers=admin_headers,
    )
    assert response.status_code == 200, response.text


async def _cancel_appointment(client, admin_headers, appointment_id):
    response = await client.patch(
        f"/api/v1/admin/appointments/{appointment_id}/cancel",
        headers=admin_headers,
    )
    return response


async def test_cancel_accepted_appointment(client, admin_headers):
    _, patient_headers = await _register_patient(client)
    service_id = await _create_service(client, admin_headers)
    appt_id = await _book_appointment(client, patient_headers, service_id, DATE_1)
    await _accept_appointment(client, admin_headers, appt_id, DATE_1)

    response = await _cancel_appointment(client, admin_headers, appt_id)
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "cancelled"


async def test_cancel_pending_appointment_returns_400(client, admin_headers):
    _, patient_headers = await _register_patient(client)
    service_id = await _create_service(client, admin_headers)
    appt_id = await _book_appointment(client, patient_headers, service_id, DATE_1)

    response = await _cancel_appointment(client, admin_headers, appt_id)
    assert response.status_code == 400
    assert response.json()["detail"] == "Only accepted appointments can be cancelled"


async def test_cancel_completed_appointment_returns_400(client, admin_headers):
    _, patient_headers = await _register_patient(client)
    service_id = await _create_service(client, admin_headers)
    appt_id = await _book_appointment(client, patient_headers, service_id, DATE_1)
    await _accept_appointment(client, admin_headers, appt_id, DATE_1)
    await _complete_appointment(client, admin_headers, appt_id)

    response = await _cancel_appointment(client, admin_headers, appt_id)
    assert response.status_code == 400
    assert response.json()["detail"] == "Only accepted appointments can be cancelled"


async def test_cancel_unknown_appointment_returns_404(client, admin_headers):
    response = await _cancel_appointment(client, admin_headers, str(uuid.uuid4()))
    assert response.status_code == 404
    assert response.json()["detail"] == "Appointment not found"


async def test_cancel_logs_activity(client, admin_headers):
    _, patient_headers = await _register_patient(client)
    service_id = await _create_service(client, admin_headers)
    appt_id = await _book_appointment(client, patient_headers, service_id, DATE_1)
    await _accept_appointment(client, admin_headers, appt_id, DATE_1)

    response = await _cancel_appointment(client, admin_headers, appt_id)
    assert response.status_code == 200, response.text

    activity_resp = await client.get("/api/v1/admin/activity", headers=admin_headers)
    assert activity_resp.status_code == 200
    cancelled = [i for i in activity_resp.json() if i["action"] == "appointment.cancelled"]
    assert len(cancelled) == 1
    assert cancelled[0]["entity_id"] == appt_id
