"""Backend tests for Hot Spot Pizza admin auth + health endpoints."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pizza-order-hub-44.preview.emergentagent.com").rstrip("/")

ADMIN_USER = "hotspotadmin"
ADMIN_PASS = "pizza@123"


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Health ----
class TestHealth:
    def test_health_ok(self, api):
        r = api.get(f"{BASE_URL}/api/health", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "healthy"
        assert "time" in data

    def test_root_ok(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


# ---- Admin Login ----
class TestAdminLogin:
    def test_login_success(self, api):
        r = api.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": ADMIN_USER, "password": ADMIN_PASS},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data and isinstance(data["access_token"], str) and len(data["access_token"]) > 10
        assert data.get("token_type") == "bearer"
        assert data.get("username") == ADMIN_USER

    def test_login_wrong_password(self, api):
        r = api.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": ADMIN_USER, "password": "wrongpass"},
            timeout=15,
        )
        assert r.status_code == 401

    def test_login_wrong_username(self, api):
        r = api.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "no_such_user", "password": ADMIN_PASS},
            timeout=15,
        )
        assert r.status_code == 401

    def test_login_missing_fields(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"username": ADMIN_USER}, timeout=15)
        assert r.status_code == 422


# ---- Admin Verify ----
class TestAdminVerify:
    @pytest.fixture(scope="class")
    def token(self, api):
        r = api.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": ADMIN_USER, "password": ADMIN_PASS},
            timeout=15,
        )
        assert r.status_code == 200
        return r.json()["access_token"]

    def test_verify_valid(self, api, token):
        r = api.get(
            f"{BASE_URL}/api/admin/verify",
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        assert r.status_code == 200
        data = r.json()
        assert data.get("valid") is True
        assert data.get("username") == ADMIN_USER

    def test_verify_missing_token(self, api):
        r = api.get(f"{BASE_URL}/api/admin/verify", timeout=15)
        assert r.status_code == 401

    def test_verify_invalid_token(self, api):
        r = api.get(
            f"{BASE_URL}/api/admin/verify",
            headers={"Authorization": "Bearer not.a.valid.token"},
            timeout=15,
        )
        assert r.status_code == 401
