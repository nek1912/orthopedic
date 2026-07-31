from datetime import date, timedelta

import pytest

pytestmark = pytest.mark.asyncio

_email_counter = 0


def _unique_email():
    global _email_counter
    _email_counter += 1
    return f"patient{_email_counter}@example.com"


def _today():
    return date.today()


def _tomorrow():
    return _today() + timedelta(days=1)


async def _register_patient(client, name="Test Patient"):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "name": name,
            "email": _unique_email(),
            "password": "password123",
        },
    )
    assert response.status_code == 200, response.text
    data = response.json()
    return data["access_token"], data["patient"]["name"]


async def _make_appointment(client, admin_headers, requested_date):
    svc_resp = await client.post(
        "/api/v1/admin/services",
        headers=admin_headers,
        json={"name": "Teeth Cleaning", "duration_minutes": 30},
    )
    assert svc_resp.status_code == 201, svc_resp.text
    token, name = await _register_patient(client)
    patient_headers = {"Authorization": f"Bearer {token}"}
    book = await client.post(
        "/api/v1/appointments",
        headers=patient_headers,
        json={"service_id": svc_resp.json()["id"], "requested_date": requested_date.isoformat()},
    )
    assert book.status_code == 201, book.text
    return book.json()["id"]


async def _accept_appointment(client, admin_headers, appointment_id, requested_date, start_time, end_time):
    response = await client.patch(
        f"/api/v1/admin/appointments/{appointment_id}/accept",
        headers=admin_headers,
        json={
            "date": requested_date.isoformat(),
            "start_time": start_time,
            "end_time": end_time,
        },
    )
    assert response.status_code == 200, response.text


async def _complete_appointment(client, admin_headers, appointment_id):
    response = await client.patch(
        f"/api/v1/admin/appointments/{appointment_id}/complete",
        headers=admin_headers,
    )
    assert response.status_code == 200, response.text


async def _get_stats(client, admin_headers):
    response = await client.get("/api/v1/admin/stats", headers=admin_headers)
    assert response.status_code == 200, response.text
    return response.json()


async def test_stats_requires_auth(client):
    response = await client.get("/api/v1/admin/stats")
    assert response.status_code == 401


async def test_stats_fresh_db(client, admin_headers):
    data = await _get_stats(client, admin_headers)
    assert data["today_count"] == 0
    assert data["pending_count"] == 0
    assert data["total_patients"] == 0
    assert data["completion_rate"] == 0.0
    assert data["next_available_day"] == _tomorrow().isoformat()
    assert data["today_appointments"] == []


async def test_stats_total_patients_counts_registrations(client, admin_headers):
    await _register_patient(client, "Alice")
    await _register_patient(client, "Bob")
    data = await _get_stats(client, admin_headers)
    assert data["total_patients"] == 2


async def test_stats_pending_and_accept_not_completed(client, admin_headers):
    tomorrow = _tomorrow()
    appt_id = await _make_appointment(client, admin_headers, tomorrow)
    data = await _get_stats(client, admin_headers)
    assert data["pending_count"] == 1
    assert data["completion_rate"] == 0.0

    await _accept_appointment(client, admin_headers, appt_id, tomorrow, "10:00", "10:30")
    data = await _get_stats(client, admin_headers)
    assert data["pending_count"] == 0
    assert data["completion_rate"] == 0.0


async def test_stats_completion_rate_100(client, admin_headers):
    tomorrow = _tomorrow()
    appt_id = await _make_appointment(client, admin_headers, tomorrow)
    await _accept_appointment(client, admin_headers, appt_id, tomorrow, "10:00", "10:30")
    await _complete_appointment(client, admin_headers, appt_id)
    data = await _get_stats(client, admin_headers)
    assert data["completion_rate"] == 100.0


async def test_stats_completion_rate_mixed(client, admin_headers):
    tomorrow = _tomorrow()
    first_id = await _make_appointment(client, admin_headers, tomorrow)
    second_id = await _make_appointment(client, admin_headers, tomorrow)
    await _accept_appointment(client, admin_headers, first_id, tomorrow, "10:00", "10:30")
    await _accept_appointment(client, admin_headers, second_id, tomorrow, "10:30", "11:00")
    await _complete_appointment(client, admin_headers, first_id)
    data = await _get_stats(client, admin_headers)
    assert data["completion_rate"] == 50.0


async def _create_unavailability(client, admin_headers, day, recurring="none"):
    response = await client.post(
        "/api/v1/admin/unavailability",
        headers=admin_headers,
        json={
            "date": day.isoformat(),
            "start_time": "09:00",
            "end_time": "17:00",
            "recurring": recurring,
        },
    )
    assert response.status_code == 201, response.text


async def test_stats_next_available_day_skips_unavailable(client, admin_headers):
    tomorrow = _tomorrow()
    await _create_unavailability(client, admin_headers, tomorrow)
    data = await _get_stats(client, admin_headers)
    assert data["next_available_day"] == (tomorrow + timedelta(days=1)).isoformat()


async def test_stats_next_available_day_none_when_fully_blocked(client, admin_headers):
    tomorrow = _tomorrow()
    for i in range(7):
        await _create_unavailability(client, admin_headers, tomorrow + timedelta(days=i), recurring="weekly")
    data = await _get_stats(client, admin_headers)
    assert data["next_available_day"] is None


async def test_stats_next_available_day_respects_capacity(client, admin_headers):
    tomorrow = _tomorrow()
    slots = [
        ("10:00", "10:30"),
        ("10:30", "11:00"),
        ("11:00", "11:30"),
        ("11:30", "12:00"),
        ("12:00", "12:30"),
        ("12:30", "13:00"),
        ("13:00", "13:30"),
        ("13:30", "14:00"),
    ]
    for start_time, end_time in slots:
        appt_id = await _make_appointment(client, admin_headers, tomorrow)
        await _accept_appointment(client, admin_headers, appt_id, tomorrow, start_time, end_time)

    data = await _get_stats(client, admin_headers)
    assert data["next_available_day"] == (tomorrow + timedelta(days=1)).isoformat()
