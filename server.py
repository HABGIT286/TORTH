#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""EARTHLINK PRO backend - standard library only.
Serves index.html and proxies authenticated requests to the official Earthlink API.
No credentials or access tokens are written to disk.
"""

from __future__ import annotations

import json
import os
import secrets
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8080"))
SESSION_COOKIE = "earthlink_pro_session"
SESSION_TTL = 12 * 60 * 60
REQUEST_TIMEOUT = 25

EARTHLINK_BASE = "https://ubapi.earthlink.iq"
TOKEN_URL = EARTHLINK_BASE + "/api/user/Token"
CHECK_SESSION_URL = EARTHLINK_BASE + "/api/user/CheckSession"
USER_DATA_URL = EARTHLINK_BASE + "/api/user/GetUserDataAr"

EARTHLINK_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://user.earthlink.iq",
    "Referer": "https://user.earthlink.iq/",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
}

_sessions: dict[str, dict[str, Any]] = {}
_sessions_lock = threading.RLock()


class EarthlinkError(Exception):
    pass


def _decode_json(raw: bytes, status: int) -> Any:
    try:
        return json.loads(raw.decode("utf-8-sig"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        preview = raw.decode("utf-8", "replace")[:250]
        raise EarthlinkError(f"استجابة Earthlink ليست JSON (HTTP {status}): {preview}")


def _request(url: str, *, method: str = "GET", headers: dict[str, str] | None = None,
             body: bytes | None = None) -> tuple[int, Any]:
    merged = dict(EARTHLINK_HEADERS)
    if headers:
        merged.update(headers)
    req = urllib.request.Request(url, data=body, headers=merged, method=method)
    try:
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
            raw = response.read()
            status = response.status
    except urllib.error.HTTPError as exc:
        raw = exc.read()
        status = exc.code
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise EarthlinkError(f"تعذر الاتصال بخوادم Earthlink: {exc}") from exc

    try:
        data = _decode_json(raw, status)
    except EarthlinkError:
        if status >= 400:
            raise EarthlinkError(f"رفض Earthlink الطلب (HTTP {status}).")
        raise
    if status < 200 or status >= 300:
        detail = ""
        if isinstance(data, dict):
            detail = str(data.get("error_description") or data.get("message") or data.get("error") or "")
        raise EarthlinkError(f"فشل طلب Earthlink (HTTP {status}): {detail or 'رفض الخادم الطلب'}")
    return status, data


def _find_token(payload: Any) -> str | None:
    if not isinstance(payload, dict):
        return None
    for key in ("access_token", "accessToken", "token"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    for key in ("data", "result", "payload"):
        found = _find_token(payload.get(key))
        if found:
            return found
    return None


def _unwrap_account(payload: Any) -> dict[str, Any]:
    current = payload
    for _ in range(6):
        if not isinstance(current, dict):
            break
        next_value = None
        for key in ("data", "result", "userData", "account", "payload"):
            candidate = current.get(key)
            if isinstance(candidate, dict):
                next_value = candidate
                break
        if next_value is None:
            break
        current = next_value
    if not isinstance(current, dict):
        raise EarthlinkError("صيغة بيانات الحساب المستلمة من Earthlink غير متوقعة.")
    return current


def earthlink_login(username: str, password: str) -> str:
    form = urllib.parse.urlencode({
        "grant_type": "password",
        "username": username,
        "password": password,
        "Logintype": "0",
    }).encode("utf-8")
    _, payload = _request(
        TOKEN_URL,
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        body=form,
    )
    token = _find_token(payload)
    if not token:
        detail = ""
        if isinstance(payload, dict):
            detail = str(payload.get("error_description") or payload.get("message") or payload.get("error") or "")
        raise EarthlinkError("لم يرجع Earthlink رمز دخول صالحاً. " + detail)
    return token


def earthlink_account(token: str) -> dict[str, Any]:
    auth = {"Authorization": "Bearer " + token}
    check_body = b"{}"
    _request(
        CHECK_SESSION_URL,
        method="POST",
        headers={"Content-Type": "application/json", **auth},
        body=check_body,
    )
    _, payload = _request(USER_DATA_URL, method="GET", headers=auth)
    return _unwrap_account(payload)


def _clean_expired_sessions() -> None:
    now = time.time()
    with _sessions_lock:
        expired = [sid for sid, item in _sessions.items() if now - item["created"] > SESSION_TTL]
        for sid in expired:
            _sessions.pop(sid, None)


class Handler(BaseHTTPRequestHandler):
    server_version = "EARTHLINK-PRO/2.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        # Avoid logging request bodies, credentials, or tokens.
        print("[EARTHLINK-PRO] " + (fmt % args))

    def _send(self, status: int, payload: Any, extra_headers: dict[str, str] | None = None) -> None:
        raw = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("X-Content-Type-Options", "nosniff")
        if extra_headers:
            for key, value in extra_headers.items():
                self.send_header(key, value)
        self.end_headers()
        self.wfile.write(raw)

    def _read_json(self) -> dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length < 1 or length > 64 * 1024:
            raise ValueError("حجم الطلب غير صالح.")
        try:
            value = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise ValueError("صيغة JSON غير صالحة.")
        if not isinstance(value, dict):
            raise ValueError("محتوى الطلب يجب أن يكون كائن JSON.")
        return value

    def _session_id(self) -> str | None:
        cookie = self.headers.get("Cookie", "")
        for part in cookie.split(";"):
            key, sep, value = part.strip().partition("=")
            if sep and key == SESSION_COOKIE:
                return value
        return None

    def _session(self) -> tuple[str | None, dict[str, Any] | None]:
        sid = self._session_id()
        if not sid:
            return None, None
        with _sessions_lock:
            item = _sessions.get(sid)
        if item and time.time() - item["created"] <= SESSION_TTL:
            return sid, item
        return sid, None

    def _cookie(self, sid: str, clear: bool = False) -> str:
        secure = self.headers.get("X-Forwarded-Proto", "").lower() == "https"
        bits = [f"{SESSION_COOKIE}={'' if clear else sid}", "Path=/", "HttpOnly", "SameSite=Lax"]
        if secure:
            bits.append("Secure")
        if clear:
            bits.append("Max-Age=0")
        else:
            bits.append(f"Max-Age={SESSION_TTL}")
        return "; ".join(bits)

    def do_GET(self) -> None:
        path = urllib.parse.urlsplit(self.path).path
        if path in ("/", "/index.html"):
            file_path = ROOT / "index.html"
            try:
                raw = file_path.read_bytes()
            except OSError:
                self.send_error(404, "index.html not found")
                return
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(raw)))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(raw)
            return

        if path == "/health":
            self._send(200, {"ok": True, "service": "EARTHLINK PRO"})
            return

        if path == "/api/me":
            sid, session = self._session()
            if not session:
                self._send(200, {"authenticated": False})
                return
            try:
                account = earthlink_account(session["token"])
                self._send(200, {"authenticated": True, "user": account})
            except EarthlinkError as exc:
                message = str(exc)
                if "401" in message or "403" in message or "رمز" in message:
                    with _sessions_lock:
                        _sessions.pop(sid, None)
                    self._send(200, {"authenticated": False, "message": "انتهت جلسة Earthlink، سجّل الدخول مجدداً."},
                               {"Set-Cookie": self._cookie(sid or "", clear=True)})
                else:
                    self._send(502, {"error": message, "authenticated": True})
            return

        self.send_error(404)

    def do_POST(self) -> None:
        path = urllib.parse.urlsplit(self.path).path
        if path == "/api/login":
            try:
                body = self._read_json()
                username = str(body.get("username", "")).strip()
                password = str(body.get("password", ""))
                if not username or not password:
                    self._send(400, {"authenticated": False, "message": "أدخل اسم المستخدم وكلمة المرور."})
                    return
                token = earthlink_login(username, password)
                account = earthlink_account(token)
                sid = secrets.token_urlsafe(32)
                _clean_expired_sessions()
                with _sessions_lock:
                    _sessions[sid] = {"token": token, "created": time.time()}
                self._send(200, {"authenticated": True, "user": account},
                           {"Set-Cookie": self._cookie(sid)})
            except ValueError as exc:
                self._send(400, {"authenticated": False, "message": str(exc)})
            except EarthlinkError as exc:
                self._send(401, {"authenticated": False, "message": str(exc)})
            except Exception:
                self._send(500, {"authenticated": False, "message": "حدث خطأ داخلي أثناء تسجيل الدخول."})
            return

        if path == "/api/logout":
            sid, _ = self._session()
            if sid:
                with _sessions_lock:
                    _sessions.pop(sid, None)
            self._send(200, {"ok": True}, {"Set-Cookie": self._cookie(sid or "", clear=True)})
            return

        self._send(404, {"error": "Not found"})


def main() -> None:
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    httpd.daemon_threads = True
    print(f"EARTHLINK PRO server listening on http://{HOST}:{PORT}", flush=True)
    print("Earthlink credentials and access tokens are kept in memory only.", flush=True)
    try:
        httpd.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
