async def test_root(client):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_admin_patients_empty(client, admin_headers):
    response = await client.get("/api/v1/admin/patients", headers=admin_headers)
    assert response.status_code == 200
    assert response.json() == []
