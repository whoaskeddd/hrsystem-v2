def test_register_login_and_me(client):
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test Candidate",
            "email": "test.candidate@example.com",
            "password": "strong-pass-123",
            "role": "candidate",
        },
    )
    assert register_response.status_code == 200
    payload = register_response.json()
    assert payload["access_token"]
    assert payload["refresh_token"]

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "test.candidate@example.com", "password": "strong-pass-123"},
    )
    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]
    me_response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "test.candidate@example.com"


def test_chats_not_implemented(client):
    response = client.get("/api/v1/chats")
    assert response.status_code == 501
    assert response.json()["code"] == "not_implemented"
