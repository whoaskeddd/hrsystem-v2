def register_user(client, *, full_name, email, role):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": full_name,
            "email": email,
            "password": "strong-pass-123",
            "role": role,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    return payload["access_token"], payload["user"]["id"]


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


def test_chats_flow(client):
    candidate_token, _ = register_user(
        client,
        full_name="Candidate One",
        email="candidate.one@example.com",
        role="candidate",
    )
    employer_token, employer_id = register_user(
        client,
        full_name="Employer One",
        email="employer.one@example.com",
        role="employer",
    )

    create_chat = client.post(
        "/api/v1/chats",
        headers={"Authorization": f"Bearer {candidate_token}"},
        json={"peer_user_id": employer_id},
    )
    assert create_chat.status_code == 200
    chat = create_chat.json()
    chat_id = chat["id"]

    send_message = client.post(
        f"/api/v1/chats/{chat_id}/messages",
        headers={"Authorization": f"Bearer {candidate_token}"},
        json={"body": "Hello from candidate"},
    )
    assert send_message.status_code == 200

    employer_chats = client.get(
        "/api/v1/chats",
        headers={"Authorization": f"Bearer {employer_token}"},
    )
    assert employer_chats.status_code == 200
    assert employer_chats.json()[0]["unread_count"] == 1

    read_chat = client.post(
        f"/api/v1/chats/{chat_id}/read",
        headers={"Authorization": f"Bearer {employer_token}"},
    )
    assert read_chat.status_code == 200

def test_chat_websocket_ping(client):
    candidate_token, _ = register_user(
        client,
        full_name="Candidate WS",
        email="candidate.ws@example.com",
        role="candidate",
    )
    _, employer_id = register_user(
        client,
        full_name="Employer WS",
        email="employer.ws@example.com",
        role="employer",
    )

    create_chat = client.post(
        "/api/v1/chats",
        headers={"Authorization": f"Bearer {candidate_token}"},
        json={"peer_user_id": employer_id},
    )
    assert create_chat.status_code == 200
    chat_id = create_chat.json()["id"]

    with client.websocket_connect(f"/api/v1/ws/chats/{chat_id}?token={candidate_token}") as ws:
        ws.send_text("ping")
        assert ws.receive_text() == "pong"
