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


async def _reject_appointment(client, admin_headers, appointment_id):
    response = await client.patch(
        f"/api/v1/admin/appointments/{appointment_id}/reject",
        headers=admin_headers,
        json={"reason": "Booked out"},
    )
    assert response.status_code == 200, response.text


async def _cancel_appointment(client, patient_headers, appointment_id):
    response = await client.patch(
        f"/api/v1/appointments/{appointment_id}/cancel",
        headers=patient_headers,
    )
    assert response.status_code == 200, response.text


async def _list_patients(client, admin_headers, search=None):
    url = "/api/v1/admin/patients"
    if search:
        url = f"{url}?search={search}"
    response = await client.get(url, headers=admin_headers)
    assert response.status_code == 200, response.text
    return response.json()


def _by_email(items, email):
    return next(i for i in items if i["email"] == email)


async def test_list_patients_requires_auth(client):
    response = await client.get("/api/v1/admin/patients")
    assert response.status_code == 401


async def test_list_patients_fresh_db_empty(client, admin_headers):
    assert await _list_patients(client, admin_headers) == []


async def test_registered_patients_have_zero_counts(client, admin_headers):
    _, patient_a = await _register_patient(client, "Patient A")
    _, patient_b = await _register_patient(client, "Patient B")

    items = await _list_patients(client, admin_headers)
    assert len(items) == 2
    for item in items:
        assert item["total_visits"] == 0
        assert item["pending_count"] == 0
        assert item["completed_count"] == 0
        assert item["prescription_count"] == 0
        assert item["last_visit_date"] is None


async def test_completed_appointment_sets_counts_and_last_visit(client, admin_headers):
    patient, patient_headers = await _register_patient(client, "Patient A")
    service_id = await _create_service(client, admin_headers)
    appt_id = await _book_appointment(client, patient_headers, service_id, DATE_1)
    await _accept_appointment(client, admin_headers, appt_id, DATE_1)
    await _complete_appointment(client, admin_headers, appt_id)

    items = await _list_patients(client, admin_headers)
    row = _by_email(items, patient["email"])
    assert row["completed_count"] == 1
    assert row["total_visits"] == 1
    assert row["pending_count"] == 0
    assert row["last_visit_date"] == DATE_1


async def test_pending_booking_increases_total_visits(client, admin_headers):
    patient, patient_headers = await _register_patient(client, "Patient A")
    service_id = await _create_service(client, admin_headers)
    first_id = await _book_appointment(client, patient_headers, service_id, DATE_1)
    await _accept_appointment(client, admin_headers, first_id, DATE_1)
    await _complete_appointment(client, admin_headers, first_id)
    await _book_appointment(client, patient_headers, service_id, DATE_2)

    items = await _list_patients(client, admin_headers)
    row = _by_email(items, patient["email"])
    assert row["pending_count"] == 1
    assert row["completed_count"] == 1
    assert row["total_visits"] == 2
    assert row["last_visit_date"] == DATE_1


async def test_accepted_appointment_increases_total_visits(client, admin_headers):
    patient, patient_headers = await _register_patient(client, "Patient A")
    service_id = await _create_service(client, admin_headers)
    first_id = await _book_appointment(client, patient_headers, service_id, DATE_1)
    await _accept_appointment(client, admin_headers, first_id, DATE_1)
    await _complete_appointment(client, admin_headers, first_id)
    await _book_appointment(client, patient_headers, service_id, DATE_2)
    third_id = await _book_appointment(client, patient_headers, service_id, DATE_3)
    await _accept_appointment(client, admin_headers, third_id, DATE_3)

    items = await _list_patients(client, admin_headers)
    row = _by_email(items, patient["email"])
    assert row["total_visits"] == 3
    assert row["completed_count"] == 1
    assert row["pending_count"] == 1


async def test_prescription_count_and_last_visit_for_second_patient(client, admin_headers):
    patient_b, patient_b_headers = await _register_patient(client, "Patient B")
    patient_a, _ = await _register_patient(client, "Patient A")
    service_id = await _create_service(client, admin_headers)
    b_appt = await _book_appointment(client, patient_b_headers, service_id, DATE_1)
    await _accept_appointment(client, admin_headers, b_appt, DATE_1)
    await _complete_appointment(client, admin_headers, b_appt)

    prescription = await client.post(
        "/api/v1/admin/prescriptions",
        headers=admin_headers,
        json={"appointment_id": b_appt, "diagnosis": "Checkup"},
    )
    assert prescription.status_code == 201, prescription.text

    items = await _list_patients(client, admin_headers)
    row = _by_email(items, patient_b["email"])
    assert row["last_visit_date"] == DATE_1
    assert row["prescription_count"] == 1
    other = _by_email(items, patient_a["email"])
    assert other["prescription_count"] == 0
    assert other["last_visit_date"] is None


async def test_rejected_and_cancelled_count_nowhere(client, admin_headers):
    patient, patient_headers = await _register_patient(client, "Patient A")
    service_id = await _create_service(client, admin_headers)
    rejected_id = await _book_appointment(client, patient_headers, service_id, DATE_1)
    await _reject_appointment(client, admin_headers, rejected_id)
    cancelled_id = await _book_appointment(client, patient_headers, service_id, DATE_2)
    await _cancel_appointment(client, patient_headers, cancelled_id)
    completed_id = await _book_appointment(client, patient_headers, service_id, DATE_3)
    await _accept_appointment(client, admin_headers, completed_id, DATE_3)
    await _complete_appointment(client, admin_headers, completed_id)
    accepted_id = await _book_appointment(client, patient_headers, service_id, DATE_4)
    await _accept_appointment(client, admin_headers, accepted_id, DATE_4)

    items = await _list_patients(client, admin_headers)
    row = _by_email(items, patient["email"])
    assert row["total_visits"] == 2
    assert row["pending_count"] == 0
    assert row["completed_count"] == 1
    assert row["last_visit_date"] == DATE_3
    assert row["prescription_count"] == 0


async def test_search_filters_patients_with_counts_intact(client, admin_headers):
    aarav, _ = await _register_patient(client, "Aarav Patel")
    await _register_patient(client, "Neha Sharma")

    items = await _list_patients(client, admin_headers, search="aar")
    assert len(items) == 1
    assert items[0]["email"] == aarav["email"]
    assert items[0]["total_visits"] == 0
    assert items[0]["pending_count"] == 0
    assert items[0]["completed_count"] == 0
    assert items[0]["prescription_count"] == 0
    assert items[0]["last_visit_date"] is None
