
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import sys
import json
import argparse
from datetime import datetime
from zoneinfo import ZoneInfo

import requests
import yaml

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
TZ = ZoneInfo(TZ_NAME)

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
    """
    Format: DD-HH:MM
    Example: 25-7:40 means day 25 at 07:40 Iraq time.
    Uses the current month and year.
    """

    match = re.fullmatch(
        r"\s*(\d{1,2})-(\d{1,2}):(\d{2})\s*",
        value,
    )

    if not match:
        raise AppError(
            "الصيغة غير صحيحة. مثال صحيح: 25-7:40"
        )

    day, hour, minute = map(int, match.groups())

    if not 1 <= day <= 31:
        raise AppError("اليوم يجب أن يكون بين 1 و31.")

    if not 0 <= hour <= 23:
        raise AppError(
            "الساعة يجب أن تكون بين 0 و23."
        )

    if not 0 <= minute <= 59:
        raise AppError(
            "الدقيقة يجب أن تكون بين 0 و59."
        )

    now = now_iraq()

    try:
        target = datetime(
            now.year,
            now.month,
            day,
            hour,
            minute,
            tzinfo=TZ,
        )
    except ValueError:
        raise AppError(
            "هذا اليوم غير موجود في الشهر الحالي."
        )

    if target <= now:
        raise AppError(
            "الموعد مضى. اختر وقتاً مستقبلياً "
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

    with open(
        "schedule.yml", "w", encoding="utf-8"
    ) as file:
        yaml.safe_dump(
            config,
            file,
            allow_unicode=True,
            sort_keys=False,
        )


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

    with open(
        schedule_path, "r", encoding="utf-8"
    ) as file:
        config = yaml.safe_load(file) or {}

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

    with open(
        schedule_path, "w", encoding="utf-8"
    ) as file:
        yaml.safe_dump(
            config,
            file,
            allow_unicode=True,
            sort_keys=False,
        )

    print("اكتمل الإرسال بنجاح.")
    return 0


# =========================================================
# INTERACTIVE MENU
# =========================================================

def interactive():
    print("=" * 48)
    print("       EARTHLINK PRO")
    print("       TELEGRAM REPORT")
    print("=" * 48)
    print("1) إرسال البيانات مباشرة الآن")
    print("2) تحديد موعد إرسال على GitHub")
    print("=" * 48)

    choice = input("اختر 1 أو 2: ").strip()

    if choice == "2":
        raw = input(
            "اكتب الموعد يوم-ساعة:دقيقة، مثال 25-7:40: "
        ).strip()

        target = parse_schedule_input(raw)
        write_schedule(target)

        print("\nتم إنشاء schedule.yml.")
        print(
            "الموعد: "
            + target.strftime("%Y-%m-%d %H:%M")
            + f" ({TZ_NAME})"
        )
        print(
            "\nارفع ملف schedule.yml المحدّث "
            "إلى الفرع الافتراضي في GitHub."
        )
        print(
            "تأكد من إضافة أسرار GitHub الأربعة "
            "قبل الموعد."
        )
        print(
            "يعمل GitHub Actions دون إبقاء الهاتف مفتوحاً، "
            "لكن قد يتأخر التنفيذ."
        )
        return 0

    if choice != "1":
        raise AppError(
            "الخيار غير صحيح. اختر 1 أو 2."
        )

    username = input(
        "اسم مستخدم إيرثلنك: "
    ).strip()

    try:
        import getpass
        password = getpass.getpass(
            "كلمة مرور إيرثلنك: "
        )
    except Exception:
        password = input(
            "كلمة مرور إيرثلنك: "
        )

    bot_token = input(
        "توكن بوت تلغرام: "
    ).strip()

    chat_id = input(
        "معرّف المحادثة Chat ID: "
    ).strip()

    if not all((
        username, password, bot_token, chat_id
    )):
        raise AppError(
            "يجب إدخال جميع الحقول المطلوبة."
        )

    print("\nجاري تسجيل الدخول...")
    token = login(username, password)

    print("جاري جلب بيانات الحساب الفعلية...")
    account = fetch_account(token)

    print("جاري إرسال التقرير...")
    messages = build_report(account, username)
    send_telegram(bot_token, chat_id, messages)

    print("تم إرسال التقرير إلى تلغرام بنجاح.")
    return 0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--scheduled",
        action="store_true",
        help="تشغيل فحص الموعد من GitHub Actions",
    )

    args = parser.parse_args()

    try:
        if args.scheduled:
            return run_scheduled()

        return interactive()

    except (
        AppError, KeyError, ValueError, OSError
    ) as exc:
        print("ERROR:", exc, file=sys.stderr)
        return 1

    except KeyboardInterrupt:
        print("\nتم الإلغاء.")
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
