
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import sys
import json
import argparse
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import requests

# =========================================================
# EARTHLINK PRO - TELEGRAM REPORT SCHEDULER
# Timezone: Iraq
# =========================================================

BASE = "https://ubapi.earthlink.iq"
TOKEN_URL = BASE + "/api/user/Token"
SESSION_URL = BASE + "/api/user/CheckSession"
DATA_URL = BASE + "/api/user/GetUserDataAr"

TIMEOUT = 30
TZ_NAME = "Asia/Baghdad"
try:
    # Use the system/IANA timezone database when the Android environment has it.
    TZ = ZoneInfo(TZ_NAME)
except (ImportError, ModuleNotFoundError, OSError, ZoneInfoNotFoundError):
    # Iraq uses UTC+3. This fallback avoids requiring the separate tzdata package.
    TZ = timezone(timedelta(hours=3), name=TZ_NAME)

HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://user.earthlink.iq",
    "Referer": "https://user.earthlink.iq/",
    "User-Agent": "Mozilla/5.0",
}

SECRET_WORDS = (
    "password", "passwd", "token", "secret",
    "authorization", "cookie", "credential", "webhook",
)

EXPIRY_WORDS = (
    "expiry", "expire", "expiration", "enddate",
    "end_date", "validto", "valid_to",
    "expirationdate", "expirydate", "expiredate",
    "subscriptionend", "تاريخ الانتهاء",
    "تاريخ انتهاء", "انتهاء الاشتراك",
    "تاريخ الصلاحية", "صالح لغاية",
)


class AppError(RuntimeError):
    pass


def now_iraq():
    return datetime.now(TZ)


def save_schedule_file(path, config):
    """Write the small schedule.yml format without third-party YAML packages."""
    lines = []
    for key, value in config.items():
        if isinstance(value, bool):
            rendered = "true" if value else "false"
        elif value is None:
            rendered = "null"
        else:
            # JSON double-quoted strings are valid YAML scalars too.
            rendered = json.dumps(str(value), ensure_ascii=False)
        lines.append(f"{key}: {rendered}")
    with open(path, "w", encoding="utf-8") as file:
        file.write("\n".join(lines) + "\n")


def load_schedule_file(path):
    """Read scalar keys from this project's simple schedule.yml without PyYAML."""
    config = {}
    with open(path, "r", encoding="utf-8") as file:
        for line_number, raw_line in enumerate(file, 1):
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if ":" not in line:
                raise AppError(f"صيغة schedule.yml غير صحيحة عند السطر {line_number}.")
            key, raw_value = line.split(":", 1)
            key = key.strip()
            raw_value = raw_value.strip()
            if not key:
                raise AppError(f"مفتاح فارغ في schedule.yml عند السطر {line_number}.")
            if raw_value.lower() == "true":
                value = True
            elif raw_value.lower() == "false":
                value = False
            elif raw_value.lower() in ("null", "~", ""):
                value = None
            elif raw_value.startswith('"'):
                try:
                    value = json.loads(raw_value)
                except json.JSONDecodeError:
                    raise AppError(f"قيمة غير صحيحة في schedule.yml عند السطر {line_number}.")
            elif raw_value.startswith("'") and raw_value.endswith("'") and len(raw_value) >= 2:
                value = raw_value[1:-1].replace("''", "'")
            else:
                value = raw_value.split(" #", 1)[0].strip()
            config[key] = value
    return config


def api_json(response):
    try:
        return response.json()
    except ValueError:
        raise AppError(
            f"استجابة غير JSON (HTTP {response.status_code}): "
            + (response.text or "")[:250]
        )


# =========================================================
# EARTHLINK LOGIN
# =========================================================

def login(username, password):
    headers = dict(HEADERS)
    headers["Content-Type"] = (
        "application/x-www-form-urlencoded"
    )

    try:
        response = requests.post(
            TOKEN_URL,
            data={
                "grant_type": "password",
                "username": username,
                "password": password,
                "Logintype": "0",
            },
            headers=headers,
            timeout=TIMEOUT,
        )
    except requests.RequestException as exc:
        raise AppError(f"تعذر الاتصال بإيرثلنك: {exc}")

    data = api_json(response)

    if not response.ok:
        if isinstance(data, dict):
            reason = (
                data.get("error_description")
                or data.get("message")
                or data.get("error")
                or str(data)
            )
        else:
            reason = str(data)

        raise AppError(
            f"فشل تسجيل الدخول HTTP "
            f"{response.status_code}: {reason}"
        )

    if not isinstance(data, dict):
        raise AppError(
            "صيغة استجابة تسجيل الدخول غير صحيحة."
        )

    token = (
        data.get("access_token")
        or data.get("accessToken")
        or data.get("token")
    )

    if not token:
        raise AppError(
            "لم يرجع الخادم رمز الدخول."
        )

    return str(token)


# =========================================================
# FETCH REAL ACCOUNT DATA
# =========================================================

def fetch_account(token):
    headers = dict(HEADERS)
    headers["Authorization"] = "Bearer " + token

    try:
        session = requests.post(
            SESSION_URL,
            headers=headers,
            json={},
            timeout=TIMEOUT,
        )
    except requests.RequestException as exc:
        raise AppError(f"تعذر فحص الجلسة: {exc}")

    if session.status_code in (401, 403):
        raise AppError(
            "جلسة إيرثلنك مرفوضة أو انتهت صلاحيتها."
        )

    if not session.ok:
        raise AppError(
            f"فشل فحص الجلسة: HTTP {session.status_code}"
        )

    try:
        response = requests.get(
            DATA_URL,
            headers=headers,
            timeout=TIMEOUT,
        )
    except requests.RequestException as exc:
        raise AppError(
            f"تعذر جلب بيانات الحساب: {exc}"
        )

    data = api_json(response)

    if not response.ok:
        raise AppError(
            f"فشل جلب البيانات HTTP "
            f"{response.status_code}: {data}"
        )

    if not isinstance(data, dict):
        raise AppError(
            "صيغة بيانات الحساب غير متوقعة."
        )

    for key in (
        "data", "result", "userData",
        "account", "payload"
    ):
        nested = data.get(key)

        if isinstance(nested, dict) and len(data) <= 5:
            return nested

    return data


# =========================================================
# FIELD FORMATTING
# =========================================================

def hidden_key(key):
    key = str(key).lower()
    return any(word in key for word in SECRET_WORDS)


def display_value(value):
    if isinstance(value, dict):
        if "value" in value:
            return display_value(value["value"])

        if "displayName" in value:
            return display_value(value["displayName"])

        return json.dumps(value, ensure_ascii=False)

    if isinstance(value, list):
        return ", ".join(
            display_value(item) for item in value
        )

    if value is None:
        return ""

    if isinstance(value, bool):
        return "نعم" if value else "لا"

    return str(value).strip()


def flatten_fields(data, prefix=""):
    rows = []

    if not isinstance(data, dict):
        if data not in (None, ""):
            rows.append((prefix or "value", data))
        return rows

    for key, value in data.items():
        if hidden_key(key):
            continue

        label = (
            f"{prefix} / {key}"
            if prefix else str(key)
        )

        if isinstance(value, dict) and (
            "value" in value or "displayName" in value
        ):
            name = str(value.get("displayName") or key)
            actual = value.get("value")

            if actual not in (None, ""):
                rows.append((name, actual))

            ignored = {
                "value", "displayName", "editable",
                "visible", "tags", "filedType",
                "fieldType",
            }

            for subkey, subvalue in value.items():
                if (
                    subkey in ignored
                    or hidden_key(subkey)
                    or subvalue in (None, "", [], {})
                ):
                    continue

                rows.extend(
                    flatten_fields({subkey: subvalue}, name)
                )

        elif isinstance(value, dict):
            rows.extend(flatten_fields(value, label))

        elif isinstance(value, list):
            if value and all(
                not isinstance(item, (dict, list))
                for item in value
            ):
                rows.append((
                    label,
                    ", ".join(str(item) for item in value)
                ))
            else:
                for index, item in enumerate(value, 1):
                    rows.extend(
                        flatten_fields(
                            item, f"{label} #{index}"
                        )
                    )

        elif value not in (None, ""):
            rows.append((label, value))

    return rows


# =========================================================
# SUBSCRIPTION EXPIRY
# =========================================================

def parse_date(value):
    if isinstance(value, (int, float)):
        stamp = float(value)

        if stamp > 10_000_000_000:
            stamp /= 1000

        if stamp > 0:
            try:
                return datetime.fromtimestamp(
                    stamp, TZ
                ).date()
            except (ValueError, OSError, OverflowError):
                return None

    if not isinstance(value, str):
        return None

    value = value.strip()

    try:
        return datetime.fromisoformat(
            value.replace("Z", "+00:00")
        ).date()
    except ValueError:
        pass

    formats = (
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%Y/%m/%d",
        "%d-%m-%Y",
        "%Y.%m.%d",
    )

    for fmt in formats:
        try:
            return datetime.strptime(
                value[:10], fmt
            ).date()
        except ValueError:
            continue

    return None


def find_expiry_fields(data, prefix=""):
    found = []

    if not isinstance(data, dict):
        return found

    for key, value in data.items():
        label = (
            f"{prefix} / {key}"
            if prefix else str(key)
        )

        normalized = re.sub(
            r"[\s_-]+", "", str(key).lower()
        )

        matches_expiry = any(
            re.sub(r"[\s_-]+", "", word.lower())
            in normalized
            for word in EXPIRY_WORDS
        )

        if matches_expiry:
            if isinstance(value, dict):
                raw = value.get(
                    "value", value.get("displayName")
                )
            else:
                raw = value

            found.append((label, raw))

        if isinstance(value, dict):
            found.extend(
                find_expiry_fields(value, label)
            )

        elif isinstance(value, list):
            for item in value:
                found.extend(
                    find_expiry_fields(item, label)
                )

    return found


# =========================================================
# TELEGRAM MESSAGE BUILDING
# =========================================================

def build_report(account, username):
    now = now_iraq()
    rows = flatten_fields(account)

    lines = [
        "📡 تقرير بيانات حساب إيرثلنك",
        f"👤 اسم المستخدم: {username}",
        (
            "🕒 وقت التحديث: "
            + now.strftime("%Y-%m-%d %H:%M:%S")
            + f" ({TZ_NAME})"
        ),
        f"📋 عدد الحقول: {len(rows)}",
        "",
        "━━━ بيانات الحساب ━━━",
    ]

    if rows:
        for label, value in rows:
            shown = display_value(value)

            if shown:
                lines.append(f"• {label}: {shown}")
    else:
        lines.append(
            "لم تُرجع الواجهة حقولاً قابلة للعرض."
        )

    lines.extend([
        "",
        "━━━ صلاحية الاشتراك ━━━",
    ])

    candidates = find_expiry_fields(account)
    valid_dates = []

    for label, raw in candidates:
        parsed = parse_date(raw)

        if parsed:
            valid_dates.append(
                (label, raw, parsed)
            )

    if valid_dates:
        label, raw, expiry = valid_dates[0]
        remaining = (expiry - now.date()).days

        lines.append(
            f"📅 تاريخ الانتهاء: {expiry.isoformat()}"
        )

        if remaining > 0:
            lines.append(
                f"⏳ الأيام المتبقية: {remaining} يوم"
            )
        elif remaining == 0:
            lines.append("⚠️ ينتهي الاشتراك اليوم.")
        else:
            lines.append(
                f"❌ انتهى الاشتراك قبل {-remaining} يوم."
            )

        if len(valid_dates) > 1:
            lines.append("تواريخ أخرى محتملة:")

            for other_label, _, other_date in valid_dates[1:5]:
                lines.append(
                    f"• {other_label}: "
                    f"{other_date.isoformat()}"
                )

    elif candidates:
        lines.append(
            "عُثر على حقول محتملة للانتهاء "
            "لكن صيغة التاريخ غير معروفة:"
        )

        for label, raw in candidates[:5]:
            lines.append(
                f"• {label}: {display_value(raw)}"
            )

        lines.append("لم يتم تخمين عدد الأيام.")

    else:
        lines.append(
            "لم يظهر حقل واضح لتاريخ الانتهاء "
            "في استجابة API."
        )
        lines.append(
            "لا يمكن حساب الأيام المتبقية "
            "دون تاريخ حقيقي من الخادم."
        )

    lines.extend([
        "",
        "المصدر: استجابة API الفعلية.",
        "لم يتم تضمين كلمة المرور أو رمز الدخول.",
    ])

    return split_message("\n".join(lines))


def split_message(message, limit=3900):
    chunks = []
    current = ""

    for line in message.splitlines():
        if len(line) > limit:
            if current:
                chunks.append(current)
                current = ""

            for start in range(0, len(line), limit):
                chunks.append(line[start:start + limit])

            continue

        candidate = (
            line if not current
            else current + "\n" + line
        )

        if len(candidate) > limit:
            chunks.append(current)
            current = line
        else:
            current = candidate

    if current:
        chunks.append(current)

    return chunks or ["تقرير إيرثلنك فارغ."]


# =========================================================
# TELEGRAM SENDING
# =========================================================

def send_telegram(bot_token, chat_id, messages):
    url = (
        "https://api.telegram.org/"
        f"bot{bot_token}/sendMessage"
    )

    for index, message in enumerate(messages, start=1):
        try:
            response = requests.post(
                url,
                json={
                    "chat_id": chat_id,
                    "text": message,
                    "disable_web_page_preview": True,
                },
                timeout=TIMEOUT,
            )
        except requests.RequestException as exc:
            raise AppError(
                f"تعذر الاتصال بتلغرام: {exc}"
            )

        result = api_json(response)

        if not response.ok or not result.get("ok"):
            description = (
                result.get("description", "خطأ غير معروف")
                if isinstance(result, dict)
                else str(result)
            )

            raise AppError(
                f"فشل إرسال الرسالة رقم {index}: "
                f"{description}"
            )


# =========================================================
# SCHEDULE FILE
# =========================================================

def parse_schedule_input(value):
    """Accept DD/H/M/AM|PM (e.g. 25/8/4/PM) or legacy DD-HH:MM."""
    value = value.strip()

    # Preferred format: day / 12-hour / minute / AM or PM.
    match = re.fullmatch(
        r"\s*(\d{1,2})\s*/\s*(\d{1,2})\s*/\s*(\d{1,2})\s*/\s*(AM|PM)\s*",
        value,
        flags=re.IGNORECASE,
    )

    if match:
        day = int(match.group(1))
        hour12 = int(match.group(2))
        minute = int(match.group(3))
        meridiem = match.group(4).upper()

        if not 1 <= hour12 <= 12:
            raise AppError("الساعة بصيغة 12 ساعة يجب أن تكون بين 1 و12.")
        if not 0 <= minute <= 59:
            raise AppError("الدقائق يجب أن تكون بين 0 و59.")

        # Convert 12-hour time to 24-hour time.
        hour = hour12 % 12
        if meridiem == "PM":
            hour += 12
    else:
        # Backward compatibility with the old 24-hour format DD-HH:MM.
        legacy = re.fullmatch(
            r"\s*(\d{1,2})-(\d{1,2}):(\d{1,2})\s*",
            value,
        )
        if not legacy:
            raise AppError(
                "الصيغة غير صحيحة. اكتب مثلاً 25/8/4/PM "
                "(يوم 25، الساعة 8:04 مساءً)."
            )
        day, hour, minute = map(int, legacy.groups())
        if not 0 <= hour <= 23:
            raise AppError("الساعة بصيغة 24 ساعة يجب أن تكون بين 0 و23.")
        if not 0 <= minute <= 59:
            raise AppError("الدقائق يجب أن تكون بين 0 و59.")

    if not 1 <= day <= 31:
        raise AppError("اليوم يجب أن يكون بين 1 و31.")

    now = now_iraq()
    try:
        target = datetime(
            now.year, now.month, day, hour, minute, tzinfo=TZ
        )
    except ValueError:
        raise AppError("هذا اليوم غير موجود في الشهر الحالي.")

    if target <= now:
        raise AppError(
            "الموعد مضى. اختر وقتاً لاحقاً اليوم أو يوماً مستقبلياً "
            "ضمن الشهر الحالي."
        )

    return target


def write_schedule(target):
    config = {
        "timezone": TZ_NAME,
        "run_at": target.isoformat(),
        "sent": False,
        "created_at": now_iraq().isoformat(),
        "note": (
            "لا تضع كلمات المرور أو التوكنات "
            "داخل هذا الملف."
        ),
    }

    save_schedule_file("schedule.yml", config)


# =========================================================
# GITHUB ACTIONS SCHEDULED RUN
# =========================================================

def run_scheduled():
    schedule_path = os.environ.get(
        "SCHEDULE_FILE", "schedule.yml"
    )

    if not os.path.exists(schedule_path):
        raise AppError(
            f"لم يتم العثور على الملف: {schedule_path}"
        )

    config = load_schedule_file(schedule_path)

    if config.get("sent") is True:
        print("تم تنفيذ هذا الموعد سابقاً.")
        return 0

    run_at_text = config.get("run_at")

    if not run_at_text:
        raise AppError(
            "ملف schedule.yml لا يحتوي run_at."
        )

    run_at = datetime.fromisoformat(str(run_at_text))

    if run_at.tzinfo is None:
        run_at = run_at.replace(tzinfo=TZ)

    now = now_iraq()

    if now < run_at:
        print(
            "لم يحن الموعد بعد: "
            + run_at.isoformat()
        )
        return 0

    username = os.environ.get(
        "EARTHLINK_USERNAME", ""
    ).strip()

    password = os.environ.get(
        "EARTHLINK_PASSWORD", ""
    )

    bot_token = os.environ.get(
        "TELEGRAM_BOT_TOKEN", ""
    ).strip()

    chat_id = os.environ.get(
        "TELEGRAM_CHAT_ID", ""
    ).strip()

    if not all((
        username, password, bot_token, chat_id
    )):
        raise AppError(
            "تأكد من إعداد GitHub Secrets الأربعة."
        )

    print("جاري تسجيل الدخول إلى إيرثلنك...")
    token = login(username, password)

    print("جاري جلب بيانات الحساب...")
    account = fetch_account(token)

    print("جاري إرسال التقرير إلى تلغرام...")
    messages = build_report(account, username)
    send_telegram(bot_token, chat_id, messages)

    config["sent"] = True
    config["sent_at"] = now_iraq().isoformat()

    save_schedule_file(schedule_path, config)

    print("اكتمل الإرسال بنجاح.")
    return 0



# =========================================================
# TELEGRAM BOT UI + SCHEDULE PUBLISHING
# =========================================================

import base64
import time

# Values are supplied by GitHub Actions Secrets / workflow environment.
# GITHUB_TOKEN should be passed as ${{ github.token }} in bot.yml.
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
OWNER_TELEGRAM_ID = os.environ.get("OWNER_TELEGRAM_ID", "").strip()
WELCOME_IMAGE_URL = os.environ.get("WELCOME_IMAGE_URL", "").strip()
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "").strip()
# Accept both our explicit variable and GitHub Actions' built-in repository name.
GITHUB_REPO = (
    os.environ.get("GITHUB_REPO", "").strip()
    or os.environ.get("GITHUB_REPOSITORY", "").strip()
)
GITHUB_BRANCH = (
    os.environ.get("GITHUB_BRANCH", "").strip()
    or os.environ.get("GITHUB_REF_NAME", "").strip()
    or "main"
)
DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL", "").strip()

BOT_API = "https://api.telegram.org/bot" + BOT_TOKEN
USER_STATES = {}


def bot_api(method, payload=None, timeout=35):
    if not BOT_TOKEN:
        raise AppError("أضف TELEGRAM_BOT_TOKEN في متغيرات البيئة أولاً.")
    try:
        response = requests.post(
            BOT_API + "/" + method,
            json=payload or {},
            timeout=timeout,
        )
    except requests.RequestException as exc:
        raise AppError("تعذر الاتصال بواجهة تلغرام: " + str(exc))
    result = api_json(response)
    if not response.ok or not isinstance(result, dict) or not result.get("ok"):
        detail = result.get("description", "خطأ غير معروف") if isinstance(result, dict) else str(result)
        raise AppError("خطأ Telegram API: " + detail)
    return result.get("result")


def send_text(chat_id, text, keyboard=None):
    payload = {"chat_id": chat_id, "text": text, "disable_web_page_preview": True}
    if keyboard:
        payload["reply_markup"] = keyboard
    # Telegram messages are limited to 4096 characters.
    if len(text) <= 4000:
        return bot_api("sendMessage", payload)
    for part in split_message(text, 3900):
        payload["text"] = part
        payload.pop("reply_markup", None)
        bot_api("sendMessage", payload)
    return None


def main_keyboard():
    return {"inline_keyboard": [
        [{"text": "START-ERTH", "callback_data": "start_erth"}],
        [{"text": "AUTO-SEND", "callback_data": "auto_send"}],
        [{"text": "DEV", "url": "https://t.me/MOTRXVIP"}],
    ]}


def send_welcome(chat_id, first_name=""):
    welcome = (f"أهلاً {first_name}! 👋\n\n"
               "مرحباً بك في EARTHLINK PRO.\n"
               "اختر من الأزرار أدناه:")
    if WELCOME_IMAGE_URL:
        try:
            bot_api("sendPhoto", {
                "chat_id": chat_id,
                "photo": WELCOME_IMAGE_URL,
                "caption": welcome,
                "reply_markup": main_keyboard(),
            })
            return
        except Exception:
            # If the future image URL is invalid, fall back to text menu.
            pass
    send_text(chat_id, welcome, main_keyboard())


def allowed_user(user_id):
    # Recommended: set OWNER_TELEGRAM_ID to restrict this private bot to you.
    return not OWNER_TELEGRAM_ID or str(user_id) == OWNER_TELEGRAM_ID


def parse_bot_schedule(value):
    """Format DD/HH/MM/SS/AM or DD/HH/MM/SS/PM; current month/year, Iraq time."""
    match = re.fullmatch(
        r"\s*(\d{1,2})/(\d{1,2})/(\d{1,2})/(\d{1,2})/(AM|PM)\s*",
        value,
        flags=re.IGNORECASE,
    )
    if not match:
        raise AppError("الصيغة غير صحيحة. اكتب مثلاً: 25/8/04/00/PM\n(يوم/ساعة/دقيقة/ثانية/AM أو PM)")
    day, hour12, minute, second = map(int, match.groups()[:4])
    meridiem = match.group(5).upper()
    if not 1 <= hour12 <= 12:
        raise AppError("الساعة يجب أن تكون من 1 إلى 12.")
    if not 0 <= minute <= 59:
        raise AppError("الدقائق يجب أن تكون من 0 إلى 59.")
    if not 0 <= second <= 59:
        raise AppError("الثواني يجب أن تكون من 0 إلى 59.")
    now = now_iraq()
    hour = hour12 % 12 + (12 if meridiem == "PM" else 0)
    try:
        target = datetime(now.year, now.month, day, hour, minute, second, tzinfo=TZ)
    except ValueError:
        raise AppError("اليوم غير موجود في هذا الشهر.")
    if target <= now:
        raise AppError("هذا الموعد صار بالماضي. اختر وقتاً مستقبلياً ضمن الشهر الحالي.")
    return target


def github_publish_schedule(config):
    """Commit schedule.yml through GitHub Contents API; no credentials are stored in YAML."""
    if not GITHUB_TOKEN or not GITHUB_REPO or "/" not in GITHUB_REPO:
        raise AppError(
            "لم تُضبط إعدادات GitHub اللازمة لحفظ الموعد. مرّر GITHUB_TOKEN "
            "(الأفضل ${{ github.token }} داخل GitHub Actions)، وGITHUB_REPO "
            "أو GITHUB_REPOSITORY، وGITHUB_BRANCH أو GITHUB_REF_NAME. "
            "لم يُرفع الموعد إلى GitHub."
        )
    api_url = "https://api.github.com/repos/" + GITHUB_REPO + "/contents/schedule.yml"
    headers = {
        "Authorization": "Bearer " + GITHUB_TOKEN,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    try:
        current = requests.get(api_url, headers=headers, params={"ref": GITHUB_BRANCH}, timeout=TIMEOUT)
        sha = None
        if current.status_code == 200:
            obj = current.json()
            sha = obj.get("sha") if isinstance(obj, dict) else None
        elif current.status_code != 404:
            raise AppError("تعذر قراءة schedule.yml من GitHub: HTTP " + str(current.status_code) + " " + current.text[:250])
        content = "\n".join(
            f'{key}: ' + ("true" if val is True else "false" if val is False else json.dumps(str(val), ensure_ascii=False))
            for key, val in config.items()
        ) + "\n"
        body = {
            "message": "Update Earthlink scheduled report",
            "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
            "branch": GITHUB_BRANCH,
        }
        if sha:
            body["sha"] = sha
        response = requests.put(api_url, headers=headers, json=body, timeout=TIMEOUT)
    except requests.RequestException as exc:
        raise AppError("فشل الاتصال بـ GitHub: " + str(exc))
    if not response.ok:
        detail = response.text[:350]
        if response.status_code in (401, 403):
            detail += " | تحقق من صلاحية contents: write في bot.yml وإعدادات Workflow permissions."
        raise AppError("لم يتم حفظ الموعد في GitHub: HTTP " + str(response.status_code) + " " + detail)


def send_discord(webhook_url, messages):
    if not webhook_url:
        return False
    for message in messages:
        # Discord webhook content limit is 2000 characters.
        for start in range(0, len(message), 1900):
            try:
                response = requests.post(webhook_url, json={"content": message[start:start + 1900]}, timeout=TIMEOUT)
            except requests.RequestException as exc:
                raise AppError("تعذر الاتصال بديسكورد: " + str(exc))
            if response.status_code not in (200, 204):
                raise AppError("فشل إرسال ديسكورد HTTP " + str(response.status_code) + ": " + response.text[:200])
    return True


def handle_callback(query):
    callback_id = query.get("id")
    message = query.get("message") or {}
    chat = message.get("chat") or {}
    chat_id = chat.get("id")
    user = query.get("from") or {}
    user_id = user.get("id")
    data = query.get("data", "")
    if callback_id:
        try:
            bot_api("answerCallbackQuery", {"callback_query_id": callback_id})
        except Exception:
            pass
    if chat_id is None:
        return
    if not allowed_user(user_id):
        send_text(chat_id, "هذا البوت خاص بصاحبه فقط.")
        return
    if data == "start_erth":
        USER_STATES[chat_id] = {"step": "username"}
        send_text(chat_id, "🔐 START-ERTH\nأرسل اسم مستخدم إيرثلنك.\n\nأرسل /cancel للإلغاء.")
    elif data == "auto_send":
        USER_STATES[chat_id] = {"step": "schedule"}
        send_text(
            chat_id,
            "⏰ AUTO-SEND\nاكتب الموعد بهذه الصيغة:\n"
            "DD/HH/MM/SS/AM أو PM\n\n"
            "مثال: 25/8/04/00/PM = يوم 25، الساعة 8:04:00 مساءً.\n"
            "السنة والشهر هما الحاليان بتوقيت العراق.\n"
            "الموعد يُحفظ في schedule.yml ويُرفع إلى GitHub حتى يعمل بعد إغلاق الهاتف.\n"
            "أرسل /cancel للإلغاء."
        )


def handle_message(message):
    chat = message.get("chat") or {}
    chat_id = chat.get("id")
    user = message.get("from") or {}
    user_id = user.get("id")
    text_in = (message.get("text") or "").strip()
    if chat_id is None:
        return
    if not allowed_user(user_id):
        send_text(chat_id, "هذا البوت خاص بصاحبه فقط.")
        return
    if text_in in ("/start", "/menu"):
        USER_STATES.pop(chat_id, None)
        send_welcome(chat_id, user.get("first_name", ""))
        return
    if text_in == "/cancel":
        USER_STATES.pop(chat_id, None)
        send_text(chat_id, "تم إلغاء العملية.", main_keyboard())
        return
    state = USER_STATES.get(chat_id)
    if not state:
        send_text(chat_id, "استخدم /start لعرض القائمة.", main_keyboard())
        return

    step = state.get("step")
    if step == "username":
        if not text_in or len(text_in) > 150:
            send_text(chat_id, "اسم المستخدم غير صالح. أعد الإرسال أو /cancel.")
            return
        state["username"] = text_in
        state["step"] = "password"
        send_text(chat_id, "أرسل كلمة مرور إيرثلنك الآن. لن أكتبها في ملف الجدولة. أرسل /cancel للإلغاء.")
        return
    if step == "password":
        if not text_in:
            send_text(chat_id, "كلمة المرور فارغة. أعد الإرسال أو /cancel.")
            return
        username = state.get("username", "")
        password = text_in
        USER_STATES.pop(chat_id, None)
        send_text(chat_id, "⏳ جاري تسجيل الدخول إلى إيرثلنك وجلب البيانات الفعلية...")
        try:
            token = login(username, password)
            account = fetch_account(token)
            for report_part in build_report(account, username):
                send_text(chat_id, report_part, main_keyboard())
        except Exception as exc:
            send_text(chat_id, "❌ تعذر جلب البيانات: " + str(exc), main_keyboard())
        finally:
            password = None
        return
    if step == "schedule":
        try:
            target = parse_bot_schedule(text_in)
            config = {
                "timezone": TZ_NAME,
                "run_at": target.isoformat(),
                "sent": False,
                "created_at": now_iraq().isoformat(),
                "chat_id": str(chat_id),
                "note": "One-time report schedule; no credentials or tokens stored here.",
            }
            save_schedule_file("schedule.yml", config)
            github_publish_schedule(config)
            USER_STATES.pop(chat_id, None)
            send_text(
                chat_id,
                "✅ تم حفظ الموعد ورفعه إلى GitHub.\n"
                f"📅 {target.strftime('%Y-%m-%d')}\n"
                f"🕒 {target.strftime('%I:%M:%S %p')} ({TZ_NAME})\n\n"
                "سيعمل GitHub Actions حتى إذا أُغلق الهاتف. قد يتأخر التنفيذ قليلاً عن الثانية المحددة لأن جدولة GitHub تعمل بدقة الدقائق عادةً.",
                main_keyboard(),
            )
        except Exception as exc:
            send_text(chat_id, "❌ لم يتم تفعيل الجدولة: " + str(exc) + "\nتأكد من إعداد GitHub Token وصلاحيات المستودع، ثم جرّب مجدداً.")
        return


def run_bot():
    if not BOT_TOKEN:
        raise AppError("ضع توكن البوت في متغير البيئة TELEGRAM_BOT_TOKEN.")
    send_text  # Keep helper visible for static analyzers.
    print("EARTHLINK PRO Telegram bot is running. Stop with Ctrl+C.")
    try:
        bot_api("deleteWebhook", {"drop_pending_updates": False})
    except Exception:
        pass
    offset = 0
    while True:
        try:
            updates = bot_api("getUpdates", {"offset": offset, "timeout": 25, "allowed_updates": ["message", "callback_query"]}, timeout=35)
            for update in updates or []:
                offset = max(offset, int(update.get("update_id", 0)) + 1)
                try:
                    if update.get("callback_query"):
                        handle_callback(update["callback_query"])
                    elif update.get("message"):
                        handle_message(update["message"])
                except Exception as exc:
                    print("Update error:", repr(exc), file=sys.stderr)
        except KeyboardInterrupt:
            print("\nBot stopped.")
            break
        except Exception as exc:
            print("Polling error:", repr(exc), file=sys.stderr)
            time.sleep(3)


def run_scheduled():
    schedule_path = os.environ.get("SCHEDULE_FILE", "schedule.yml")
    if not os.path.exists(schedule_path):
        print("No schedule.yml; nothing to do.")
        return 0
    config = load_schedule_file(schedule_path)
    if config.get("sent") is True:
        print("This scheduled report has already been sent.")
        return 0
    run_at_text = config.get("run_at")
    if not run_at_text:
        print("No active schedule in schedule.yml; nothing to do.")
        return 0
    run_at = datetime.fromisoformat(str(run_at_text))
    if run_at.tzinfo is None:
        run_at = run_at.replace(tzinfo=TZ)
    if now_iraq() < run_at:
        print("Not due yet:", run_at.isoformat())
        return 0

    username = os.environ.get("EARTHLINK_USERNAME", "").strip()
    password = os.environ.get("EARTHLINK_PASSWORD", "")
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = str(config.get("chat_id") or os.environ.get("TELEGRAM_CHAT_ID", "")).strip()
    webhook = os.environ.get("DISCORD_WEBHOOK_URL", "").strip()
    if not all((username, password, bot_token, chat_id)):
        raise AppError("Set GitHub Secrets: EARTHLINK_USERNAME, EARTHLINK_PASSWORD, TELEGRAM_BOT_TOKEN; schedule.yml must contain chat_id or TELEGRAM_CHAT_ID secret must be set.")

    token = login(username, password)
    account = fetch_account(token)
    messages = build_report(account, username)
    send_telegram(bot_token, chat_id, messages)
    if webhook:
        send_discord(webhook, messages)
    config["sent"] = True
    config["sent_at"] = now_iraq().isoformat()
    save_schedule_file(schedule_path, config)
    print("Scheduled report sent.")
    return 0


def main():
    parser = argparse.ArgumentParser(description="EARTHLINK PRO Telegram bot")
    parser.add_argument("--scheduled", action="store_true", help="Run one scheduled report check (GitHub Actions)")
    args = parser.parse_args()
    try:
        if args.scheduled:
            return run_scheduled()
        run_bot()
        return 0
    except (AppError, KeyError, ValueError, OSError) as exc:
        print("ERROR:", exc, file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
