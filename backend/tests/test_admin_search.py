import pytest

pytestmark = pytest.mark.asyncio

_email_counter = 0


def _unique_email():
    global _email_counter
    _email_counter += 1
    return f"patient{_email_counter}@example.com"


async def _register_patient(client, name="Test Patient", phone=None):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "name": name,
            "email": _unique_email(),
            "password": "password123",
            "phone": phone,
        },
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


async def _search(client, admin_headers, q=None):
    url = "/api/v1/admin/search"
    if q is not None:
        url = f"{url}?q={q}"
    response = await client.get(url, headers=admin_headers)
    assert response.status_code == 200, response.text
    return response.json()


async def test_search_requires_auth(client):
    response = await client.get("/api/v1/admin/search?q=anything")
    assert response.status_code == 401


async def test_search_patient_by_name(client, admin_headers):
    patient, _ = await _register_patient(client, name="Priya Sharma")
    result = await _search(client, admin_headers, q="priya")
    assert patient["id"] in [p["id"] for p in result["patients"]]


async def test_search_patient_by_phone(client, admin_headers):
    patient, _ = await _register_patient(client, name="Rohan Verma", phone="9876543210")
    result = await _search(client, admin_headers, q="98765")
    assert patient["id"] in [p["id"] for p in result["patients"]]


async def test_search_service_by_name(client, admin_headers):
    await _create_service(client, admin_headers)
    result = await _search(client, admin_headers, q="cleaning")
    assert "Teeth Cleaning" in [s["name"] for s in result["services"]]


async def test_search_appointment_by_patient_name(client, admin_headers):
    _, patient_headers = await _register_patient(client, name="Ananya Gupta")
    service_id = await _create_service(client, admin_headers)
    await _book_appointment(client, patient_headers, service_id, "2026-08-05")
    result = await _search(client, admin_headers, q="Ananya")
    assert len(result["appointments"]) == 1
    assert result["appointments"][0]["patient_name"] == "Ananya Gupta"
    assert result["appointments"][0]["status"] == "pending"


async def test_search_appointment_by_status(client, admin_headers):
    _, patient_headers = await _register_patient(client)
    service_id = await _create_service(client, admin_headers)
    await _book_appointment(client, patient_headers, service_id, "2026-08-05")
    result = await _search(client, admin_headers, q="pending")
    assert len(result["appointments"]) == 1
    assert result["appointments"][0]["requested_date"] == "2026-08-05"


async def test_search_appointment_by_partial_date(client, admin_headers):
    _, patient_headers = await _register_patient(client)
    service_id = await _create_service(client, admin_headers)
    await _book_appointment(client, patient_headers, service_id, "2026-08-05")
    result = await _search(client, admin_headers, q="2026-08")
    assert len(result["appointments"]) == 1
    assert result["appointments"][0]["requested_date"] == "2026-08-05"


async def test_search_empty_or_missing_q_returns_empty_sections(client, admin_headers):
    for url in [
        "/api/v1/admin/search",
        "/api/v1/admin/search?q=",
        "/api/v1/admin/search?q=%20",
    ]:
        response = await client.get(url, headers=admin_headers)
        assert response.status_code == 200, response.text
        assert response.json() == {"patients": [], "services": [], "appointments": []}


async def test_search_no_match_returns_empty_lists(client, admin_headers):
    _, patient_headers = await _register_patient(client)
    service_id = await _create_service(client, admin_headers)
    await _book_appointment(client, patient_headers, service_id, "2026-08-05")
    result = await _search(client, admin_headers, q="zzzz-no-match")
    assert result == {"patients": [], "services": [], "appointments": []}


async def test_search_limits_each_section_to_five(client, admin_headers):
    for i in range(6):
        await _register_patient(client, name=f"SameName Patient {i}")
    result = await _search(client, admin_headers, q="SameName")
    assert len(result["patients"]) == 5
