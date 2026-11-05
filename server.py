import os
import secrets
import logging
from datetime import datetime, timezone
from threading import RLock

import requests
from flask import Flask, request, jsonify, make_response, send_from_directory

# =========================================================
# EARTHLINK PRO - SECURE API BACKEND
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 1024 * 1024

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(message)s"
)

EARTHLINK_BASE = "https://ubapi.earthlink.iq"

TOKEN_URL = EARTHLINK_BASE + "/api/user/Token"
CHECK_SESSION_URL = EARTHLINK_BASE + "/api/user/CheckSession"
USER_DATA_URL = EARTHLINK_BASE + "/api/user/GetUserDataAr"

EARTHLINK_ORIGIN = "https://user.earthlink.iq"

REQUEST_TIMEOUT = 25

COOKIE_NAME = "earthlink_pro_sid"

COOKIE_SECURE = os.environ.get(
    "COOKIE_SECURE", "false"
).lower() == "true"

# جلسات المستخدمين والـTokens تبقى في ذاكرة الخادم.
# عند إعادة تشغيل Python تنتهي الجلسات ويجب تسجيل الدخول مجدداً.
SESSIONS = {}
SESSIONS_LOCK = RLock()


def earthlink_headers(token=None):
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Origin": EARTHLINK_ORIGIN,
        "Referer": EARTHLINK_ORIGIN + "/",
        "User-Agent": (
            "Mozilla/5.0 (Linux; Android 15) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/130.0.0.0 Mobile Safari/537.36"
        )
    }

    if token:
        headers["Authorization"] = "Bearer " + token

    return headers


def get_session_id():
    sid = request.cookies.get(COOKIE_NAME)

    if not sid:
        return None

    if len(sid) < 40 or len(sid) > 150:
        return None

    return sid


def get_session():
    sid = get_session_id()

    if not sid:
        return None

    with SESSIONS_LOCK:
        return SESSIONS.get(sid)


def create_session(token, username):
    sid = secrets.token_urlsafe(48)

    with SESSIONS_LOCK:
        SESSIONS[sid] = {
            "token": token,
            "username": username,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_seen": datetime.now(timezone.utc).isoformat()
        }

    return sid


def remove_session(sid):
    if not sid:
        return

    with SESSIONS_LOCK:
        SESSIONS.pop(sid, None)


def json_response(data, status=200):
    response = make_response(jsonify(data), status)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


def parse_upstream_response(response):
    try:
        return response.json()
    except ValueError:
        return {
            "message": response.text[:1000]
        }


def extract_token(payload):
    if not isinstance(payload, dict):
        return None

    candidates = [
        payload,
        payload.get("data"),
        payload.get("result"),
        payload.get("token")
    ]

    for item in candidates:
        if not isinstance(item, dict):
            continue

        token = (
            item.get("access_token")
            or item.get("accessToken")
            or item.get("token")
        )

        if token and isinstance(token, str):
            return token

    return None


def extract_error(payload, default):
    if isinstance(payload, dict):
        return (
            payload.get("error_description")
            or payload.get("message")
            or payload.get("error")
            or default
        )

    return default


def call_earthlink_login(username, password):
    """
    يرسل بيانات الدخول إلى Token endpoint.
    لا يتم تخزين كلمة المرور في الجلسة.
    """

    form_data = {
        "grant_type": "password",
        "username": username,
        "password": password,
        "Logintype": "0"
    }

    response = requests.post(
        TOKEN_URL,
        data=form_data,
        headers={
            **earthlink_headers(),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        timeout=REQUEST_TIMEOUT
    )

    payload = parse_upstream_response(response)

    if not response.ok:
        message = extract_error(
            payload,
            "رفض خادم Earthlink تسجيل الدخول."
        )

        raise ValueError(
            "Earthlink login failed: " + str(message)
        )

    token = extract_token(payload)

    if not token:
        raise ValueError(
            "لم يعثر الخادم على access_token في استجابة Earthlink."
        )

    return token


def check_earthlink_session(token):
    """
    التحقق من صلاحية جلسة Earthlink.
    """

    response = requests.post(
        CHECK_SESSION_URL,
        json={},
        headers=earthlink_headers(token),
        timeout=REQUEST_TIMEOUT
    )

    payload = parse_upstream_response(response)

    if response.status_code in (401, 403):
        return False, payload

    if not response.ok:
        return False, payload

    if isinstance(payload, dict):
        if payload.get("authenticated") is False:
            return False, payload

        if payload.get("isValid") is False:
            return False, payload

        if payload.get("valid") is False:
            return False, payload

    return True, payload


def get_earthlink_user_data(token):
    """
    جلب بيانات المشترك الفعلية.
    """

    response = requests.get(
        USER_DATA_URL,
        headers=earthlink_headers(token),
        timeout=REQUEST_TIMEOUT
    )

    payload = parse_upstream_response(response)

    if response.status_code in (401, 403):
        raise PermissionError(
            "انتهت صلاحية جلسة Earthlink. سجّل الدخول مجدداً."
        )

    if not response.ok:
        message = extract_error(
            payload,
            "تعذر جلب بيانات المشترك."
        )

        raise RuntimeError(str(message))

    return payload


def find_user_object(payload):
    """
    يحافظ على البيانات كما وصلت من API،
    ويحاول العثور على كائن الحساب داخل الاستجابة.
    """

    current = payload

    for _ in range(6):
        if not isinstance(current, dict):
            break

        next_value = (
            current.get("data")
            or current.get("result")
            or current.get("userData")
            or current.get("account")
            or current.get("payload")
        )

        if not isinstance(next_value, dict):
            break

        current = next_value

    return current if isinstance(current, dict) else {}


# =========================================================
# ROUTES
# =========================================================

@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/health")
def health():
    return json_response({
        "status": "ok",
        "service": "EARTHLINK PRO",
        "time": datetime.now(timezone.utc).isoformat()
    })


@app.post("/api/login")
def api_login():
    body = request.get_json(silent=True)

    if not isinstance(body, dict):
        return json_response({
            "authenticated": False,
            "message": "بيانات الطلب غير صحيحة."
        }, 400)

    username = str(body.get("username", "")).strip()
    password = str(body.get("password", ""))

    if not username or not password:
        return json_response({
            "authenticated": False,
            "message": "أدخل اسم المستخدم وكلمة المرور."
        }, 400)

    if len(username) > 200 or len(password) > 500:
        return json_response({
            "authenticated": False,
            "message": "طول بيانات الدخول غير مقبول."
        }, 400)

    try:
        token = call_earthlink_login(username, password)

        valid, check_result = check_earthlink_session(token)

        if not valid:
            logging.warning(
                "Earthlink session validation failed for login."
            )

            return json_response({
                "authenticated": False,
                "message": (
                    "تم استلام Token لكن تعذر تأكيد صلاحية الجلسة."
                )
            }, 401)

        sid = create_session(token, username)

        response = json_response({
            "authenticated": True,
            "message": "تم تسجيل الدخول بنجاح."
        })

        response.set_cookie(
            COOKIE_NAME,
            sid,
            httponly=True,
            secure=COOKIE_SECURE,
            samesite="Lax",
            max_age=60 * 60 * 12,
            path="/"
        )

        return response

    except requests.Timeout:
        return json_response({
            "authenticated": False,
            "message": "انتهت مهلة الاتصال بخادم Earthlink."
        }, 504)

    except requests.RequestException:
        logging.exception("Earthlink network error during login.")

        return json_response({
            "authenticated": False,
            "message": "تعذر الاتصال بخدمة Earthlink."
        }, 502)

    except ValueError as error:
        logging.warning("Earthlink login rejected: %s", error)

        return json_response({
            "authenticated": False,
            "message": str(error)
        }, 401)

    except Exception:
        logging.exception("Unexpected login error.")

        return json_response({
            "authenticated": False,
            "message": "حدث خطأ داخلي أثناء تسجيل الدخول."
        }, 500)


@app.get("/api/me")
def api_me():
    sid = get_session_id()
    session_data = get_session()

    if not sid or not session_data:
        return json_response({
            "authenticated": False,
            "message": "لا توجد جلسة دخول صالحة."
        }, 401)

    token = session_data.get("token")

    if not token:
        remove_session(sid)

        return json_response({
            "authenticated": False,
            "message": "الجلسة غير صالحة. سجّل الدخول مجدداً."
        }, 401)

    try:
        valid, check_result = check_earthlink_session(token)

        if not valid:
            remove_session(sid)

            response = json_response({
                "authenticated": False,
                "message": "انتهت صلاحية جلسة Earthlink."
            }, 401)

            response.delete_cookie(COOKIE_NAME, path="/")
            return response

        user_data = get_earthlink_user_data(token)

        with SESSIONS_LOCK:
            if sid in SESSIONS:
                SESSIONS[sid]["last_seen"] = (
                    datetime.now(timezone.utc).isoformat()
                )

        return json_response({
            "authenticated": True,
            "user": user_data,
            "server_time": datetime.now(timezone.utc).isoformat()
        })

    except PermissionError as error:
        remove_session(sid)

        response = json_response({
            "authenticated": False,
            "message": str(error)
        }, 401)

        response.delete_cookie(COOKIE_NAME, path="/")
        return response

    except requests.Timeout:
        return json_response({
            "authenticated": True,
            "message": "انتهت مهلة طلب تحديث البيانات."
        }, 504)

    except requests.RequestException:
        logging.exception("Earthlink network error during account refresh.")

        return json_response({
            "authenticated": True,
            "message": "تعذر الاتصال بخادم Earthlink حالياً."
        }, 502)

    except Exception:
        logging.exception("Unexpected account data error.")

        return json_response({
            "authenticated": True,
            "message": "حدث خطأ أثناء قراءة بيانات الحساب."
        }, 500)


@app.post("/api/logout")
def api_logout():
    sid = get_session_id()
    remove_session(sid)

    response = json_response({
        "success": True,
        "message": "تم تسجيل الخروج."
    })

    response.delete_cookie(COOKIE_NAME, path="/")
    return response


# =========================================================
# SECURITY HEADERS
# =========================================================

@app.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=()"
    )
    response.headers["Cache-Control"] = "no-store"

    return response


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))

    print("=" * 58)
    print("EARTHLINK PRO - SUBSCRIBER COMMAND CENTER")
    print("=" * 58)
    print("Server: http://127.0.0.1:" + str(port))
    print("API:    " + EARTHLINK_BASE)
    print("=" * 58)

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False,
        threaded=True
    )
