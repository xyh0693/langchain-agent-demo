from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_returns_ok_status():
    response = client.get("/health")
    assert response.json() == {"status": "ok"}


def test_chat_stream_endpoint_exists():
    response = client.post(
        "/chat/stream",
        json={"message": "hello"},
    )
    assert response.status_code != 404
