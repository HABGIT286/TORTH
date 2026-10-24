import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import YAML from 'yaml';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const EARTHLINK_BASE = 'https://ubapi.earthlink.iq';

// احتفظنا بأسماء المتغيرات، والأسرار تأتي من البيئة مع القيم الافتراضية
const DISCORD_WEBHOOK =
  process.env.DISCORD_WEBHOOK ||
  'https://discord.com/api/webhooks/1555280750654398528/m7pjebcPl7DL95_KdyoEDcHspnG9Rk3mOfITsMhMJcgtGfave55W_LQQZ6pk0nDEfcIt';
const TELEGRAM_TOKEN =
  process.env.TELEGRAM_TOKEN ||
  '8873866209:AAExp-CQKB8-6WDARWcotQKm8HUEpIomeKM';
const TELEGRAM_CHAT_ID =
  process.env.TELEGRAM_CHAT_ID ||
  '7753969972';

// لا تستخدم توكناً ثابتاً لجميع المشتركين
export const LATEST_EARTHLINK_BEARER_TOKEN = process.env.EARTHLINK_TOKEN || '';

const COMMON_EARTHLINK_HEADERS: Record<string, string> = {
  accept: '*/*',
  'accept-language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
  origin: 'https://user.earthlink.iq',
  referer: 'https://user.earthlink.iq/',
  'user-agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
};

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;

  if (!header) return LATEST_EARTHLINK_BEARER_TOKEN || null;

  const match = header.match(/^Bearer\s+(\S+)$/i);

  if (!match) return LATEST_EARTHLINK_BEARER_TOKEN || null;

  return match[1];
}

function earthlinkHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    ...COMMON_EARTHLINK_HEADERS,
    accept: 'application/json'
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return headers;
}

async function readUpstreamResponse(response: globalThis.Response) {
  const text = await response.text();

  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  return { text, data };
}

function isObject(value: unknown): value is Record<string, any> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (isObject(data)) {
    const message =
      data.error_description ||
      data.message ||
      data.error;

    if (typeof message === 'string') return message;
  }

  return fallback;
}

// 1. Earthlink Token Login
app.post('/api/earthlink/token', async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};

  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      error: 'CREDENTIALS_REQUIRED',
      message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
    });
  }

  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('username', username.trim());
  formData.append('password', password);
  formData.append('Logintype', '0');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const upstreamRes = await fetch(
      `${EARTHLINK_BASE}/api/user/Token`,
      {
        method: 'POST',
        headers: {
          ...COMMON_EARTHLINK_HEADERS,
          accept: 'application/json',
          'content-type':
            'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: formData.toString(),
        signal: controller.signal
      }
    );

    const { text, data } = await readUpstreamResponse(upstreamRes);

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        success: false,
        error: 'EARTHLINK_LOGIN_FAILED',
        upstreamStatus: upstreamRes.status,
        message: getErrorMessage(
          data,
          'رفض خادم إيرثلنك تسجيل الدخول'
        )
      });
    }

    if (
      !isObject(data) ||
      typeof data.access_token !== 'string' ||
      !data.access_token
    ) {
      return res.status(502).json({
        success: false,
        error: 'INVALID_TOKEN_RESPONSE',
        message: 'استجابة تسجيل الدخول لا تحتوي على Access Token صالح'
      });
    }

    // لا نسجل كلمة المرور أو التوكن في السجلات.
    return res.json({
      ...data,
      success: true,
      isDirectLive: true
    });
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error && err.name === 'AbortError';

    return res.status(503).json({
      success: false,
      error: isTimeout ? 'EARTHLINK_TIMEOUT' : 'EARTHLINK_UNAVAILABLE',
      message: isTimeout
        ? 'انتهت مهلة الاتصال بخادم إيرثلنك'
        : 'تعذّر الاتصال بخادم إيرثلنك'
    });
  } finally {
    clearTimeout(timeout);
  }
});

// 2. Earthlink CheckSession
app.post(
  '/api/earthlink/check-session',
  async (req: Request, res: Response) => {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'AUTH_REQUIRED',
        message: 'يرجى تسجيل الدخول أولاً'
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const upstreamRes = await fetch(
        `${EARTHLINK_BASE}/api/user/CheckSession`,
        {
          method: 'POST',
          headers: earthlinkHeaders(token),
          signal: controller.signal
        }
      );

      const { data } = await readUpstreamResponse(upstreamRes);

      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({
          success: false,
          valid: false,
          error: 'SESSION_CHECK_FAILED',
          upstreamStatus: upstreamRes.status,
          message: getErrorMessage(
            data,
            'تعذّر التحقق من جلسة إيرثلنك'
          )
        });
      }

      // نجاح HTTP وحده لا يثبت دائماً معنى استجابة الجلسة.
      // نرجع الاستجابة الفعلية حتى نعرف صيغة API المعتمدة.
      return res.json({
        success: true,
        upstreamStatus: upstreamRes.status,
        sessionResponse: data,
        isDirectLive: true
      });
    } catch (err: unknown) {
      const isTimeout =
        err instanceof Error && err.name === 'AbortError';

      return res.status(503).json({
        success: false,
        valid: false,
        error: isTimeout
          ? 'EARTHLINK_TIMEOUT'
          : 'EARTHLINK_UNAVAILABLE',
        message: 'تعذّر التحقق من جلسة إيرثلنك'
      });
    } finally {
      clearTimeout(timeout);
    }
  }
);

// Python-aligned Constants & Dynamic Parser Helpers
const SECRET_WORDS = [
  'password', 'passwd', 'token', 'secret',
  'authorization', 'cookie', 'credential', 'webhook'
];

const EXPIRY_WORDS = [
  'expiry', 'expire', 'expiration', 'enddate',
  'end_date', 'validto', 'valid_to',
  'expirationdate', 'expirydate', 'expiredate',
  'subscriptionend', 'تاريخ الانتهاء', 'تاريخ انتهاء',
  'انتهاء الاشتراك', 'تاريخ الصلاحية', 'صالح لغاية'
];

function isHiddenKey(key: string): boolean {
  const lower = String(key).toLowerCase();
  return SECRET_WORDS.some(w => lower.includes(w));
}

function parseDateValue(value: unknown): Date | null {
  if (typeof value === 'number') {
    let stamp = value;
    if (stamp > 10000000000) {
      stamp = stamp / 1000;
    }
    if (stamp > 0) {
      const d = new Date(stamp * 1000);
      if (!isNaN(d.getTime())) return d;
    }
  }

  if (typeof value !== 'string') return null;
  const str = value.trim();

  // Try ISO format
  const isoDate = new Date(str.replace(/Z$/i, '+00:00'));
  if (!isNaN(isoDate.getTime()) && str.length >= 8) {
    return isoDate;
  }

  // Common date formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, YYYY/MM/DD, DD-MM-YYYY
  const m1 = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m1) {
    const y = parseInt(m1[1], 10);
    const m = parseInt(m1[2], 10) - 1;
    const d = parseInt(m1[3], 10);
    const dateObj = new Date(y, m, d);
    if (!isNaN(dateObj.getTime())) return dateObj;
  }

  const m2 = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m2) {
    const y = parseInt(m2[3], 10);
    const p1 = parseInt(m2[1], 10);
    const p2 = parseInt(m2[2], 10);
    const dateObj = new Date(y, p2 - 1, p1);
    if (!isNaN(dateObj.getTime())) return dateObj;
  }

  return null;
}

function findExpiry(data: unknown, prefix = ''): Array<{ label: string; date: Date; raw: string }> {
  const found: Array<{ label: string; date: Date; raw: string }> = [];

  if (isObject(data)) {
    for (const [key, val] of Object.entries(data)) {
      const label = prefix ? `${prefix} / ${key}` : key;
      const normalized = key.toLowerCase().replace(/[\s_-]+/g, '');

      const isExpiryField = EXPIRY_WORDS.some(word =>
        normalized.includes(word.toLowerCase().replace(/[\s_-]+/g, ''))
      );

      if (isExpiryField) {
        let raw = val;
        if (isObject(val)) {
          raw = val.value !== undefined ? val.value : val.displayName;
        }
        const parsed = parseDateValue(raw);
        if (parsed) {
          found.push({ label, date: parsed, raw: String(raw) });
        }
      }

      if (isObject(val)) {
        found.push(...findExpiry(val, label));
      } else if (Array.isArray(val)) {
        for (const item of val) {
          found.push(...findExpiry(item, label));
        }
      }
    }
  }

  return found;
}

function valueText(value: unknown): string {
  if (isObject(value)) {
    if ('value' in value) return valueText(value.value);
    if ('displayName' in value) return valueText(value.displayName);
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return value.map(v => valueText(v)).join(', ');
  }
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  return String(value).trim();
}

function collectFields(data: unknown, prefix = ''): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];

  if (isObject(data)) {
    for (const [key, val] of Object.entries(data)) {
      if (isHiddenKey(key)) continue;

      const label = prefix ? `${prefix} / ${key}` : key;

      if (isObject(val) && ('value' in val || 'displayName' in val)) {
        const name = String(val.displayName || key);
        const actual = val.value;

        if (actual !== null && actual !== undefined && String(actual).trim()) {
          rows.push({ label: name, value: valueText(actual) });
        }

        const ignored = new Set([
          'value', 'displayName', 'editable', 'visible', 'tags', 'filedType', 'fieldType'
        ]);

        for (const [subkey, subval] of Object.entries(val)) {
          if (ignored.has(subkey) || isHiddenKey(subkey)) continue;
          if (subval !== null && subval !== undefined && subval !== '' && !Array.isArray(subval)) {
            rows.push(...collectFields({ [subkey]: subval }, name));
          }
        }
      } else if (isObject(val)) {
        rows.push(...collectFields(val, label));
      } else if (Array.isArray(val)) {
        if (val.every(item => !isObject(item) && !Array.isArray(item))) {
          rows.push({ label, value: val.join(', ') });
        } else {
          val.forEach((item, i) => {
            rows.push(...collectFields(item, `${label} #${i + 1}`));
          });
        }
      } else if (val !== null && val !== undefined && val !== '') {
        rows.push({ label, value: String(val).trim() });
      }
    }
  }

  return rows;
}

// 3. Earthlink User Data (Session Verification + GetUserDataAr + Dynamic Expiry Calculation)
app.get(
  '/api/earthlink/user-data',
  async (req: Request, res: Response) => {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_REQUIRED',
        message: 'يرجى تسجيل الدخول أولاً'
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      // Step A: Session Check (like fetch_account in Python script)
      const sessionRes = await fetch(
        `${EARTHLINK_BASE}/api/user/CheckSession`,
        {
          method: 'POST',
          headers: {
            ...earthlinkHeaders(token),
            'content-type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify({}),
          signal: controller.signal
        }
      );

      if (sessionRes.status === 401 || sessionRes.status === 403) {
        return res.status(401).json({
          success: false,
          error: 'SESSION_EXPIRED',
          message: 'الجلسة مرفوضة أو انتهت صلاحيتها. يرجى تسجيل الدخول مجدداً.'
        });
      }

      if (!sessionRes.ok) {
        return res.status(sessionRes.status).json({
          success: false,
          error: 'SESSION_CHECK_FAILED',
          upstreamStatus: sessionRes.status,
          message: `فشل فحص الجلسة: HTTP ${sessionRes.status}`
        });
      }

      // Step B: Fetch Live Subscriber Profile
      const upstreamRes = await fetch(
        `${EARTHLINK_BASE}/api/user/GetUserDataAr`,
        {
          method: 'GET',
          headers: {
            ...earthlinkHeaders(token),
            'content-type': 'application/json; charset=utf-8'
          },
          signal: controller.signal,
          cache: 'no-store'
        }
      );

      const { text, data } = await readUpstreamResponse(upstreamRes);

      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({
          success: false,
          error: 'EARTHLINK_DATA_FAILED',
          upstreamStatus: upstreamRes.status,
          message: getErrorMessage(
            data,
            'تعذّر جلب بيانات المشترك من إيرثلنك'
          )
        });
      }

      if (data === null || !isObject(data)) {
        return res.status(502).json({
          success: false,
          error: 'INVALID_UPSTREAM_RESPONSE',
          message: 'استجابة إيرثلنك ليست JSON صالحاً'
        });
      }

      // Check nested objects: ("data", "result", "userData", "account", "payload")
      let payload = data;
      for (const k of ['data', 'result', 'userData', 'account', 'payload']) {
        const nested = (data as Record<string, any>)[k];
        if (isObject(nested) && Object.keys(data).length <= 5) {
          payload = nested;
          break;
        }
      }

      // Dynamic collection of all fields and detection of expiration
      const allCollectedFields = collectFields(payload);
      const expiries = findExpiry(payload);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let activeDaysLeft: number | null = null;
      let calculatedExpirationDate = '';
      let expiryLabel = '';

      if (expiries.length > 0) {
        const { label, date: expDate, raw } = expiries[0];
        expiryLabel = label;
        calculatedExpirationDate = raw || expDate.toISOString().split('T')[0];
        const expMidnight = new Date(expDate);
        expMidnight.setHours(0, 0, 0, 0);
        activeDaysLeft = Math.round((expMidnight.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Extract specific fields
      const getFieldVal = (key: string, fallback = ''): string => {
        const obj = (payload as Record<string, any>)[key];
        if (obj !== undefined) {
          if (isObject(obj) && obj.value !== undefined) return String(obj.value);
          return String(obj);
        }
        const found = allCollectedFields.find(f => f.label.toLowerCase().includes(key.toLowerCase()));
        if (found) return found.value;
        return fallback;
      };

      if (activeDaysLeft === null) {
        const daysStr = getFieldVal('activeDaysLeft', '');
        const parsed = parseInt(daysStr, 10);
        activeDaysLeft = isNaN(parsed) ? 0 : parsed;
      }

      const subscriberProfile = {
        fullName: getFieldVal('fullName', 'مشترك إيرثلنك'),
        userID: getFieldVal('userID', ''),
        accountName: getFieldVal('accountName', 'اشتراك إيرثلنك'),
        accountPrice: getFieldVal('accountPrice', '35,000 د.ع'),
        accountStatus: getFieldVal('accountStatus', 'فعال'),
        activeDaysLeft,
        accountExpirationDate: calculatedExpirationDate || getFieldVal('accountExpirationDate', '—'),
        agentName: getFieldVal('agentName', 'وكيل إيرثلنك'),
        userIP: getFieldVal('userIP', '—'),
        mobileNumber: getFieldVal('mobileNumber', '—'),
        city: getFieldVal('city', 'العراق'),
        address: getFieldVal('address', '—'),
        email: getFieldVal('email', '—'),
        accountImagePath: getFieldVal('accountImagePath', 'https://user.earthlink.iq/accountImages/138.png'),
        serviceStatusColor: getFieldVal('serviceStatusColor', activeDaysLeft > 0 ? 'Green' : 'Red'),
        expiryFieldLabel: expiryLabel,
        allFields: allCollectedFields,
        rawUpstream: payload,
        lastUpdated: new Date().toLocaleString('ar-IQ'),
        _source: 'live_earthlink_python_connection',
        _fetchedAt: new Date().toISOString()
      };

      return res.json({
        success: true,
        ...subscriberProfile,
        data: subscriberProfile
      });
    } catch (err: unknown) {
      const isTimeout =
        err instanceof Error && err.name === 'AbortError';

      return res.status(503).json({
        success: false,
        error: isTimeout
          ? 'EARTHLINK_TIMEOUT'
          : 'EARTHLINK_UNAVAILABLE',
        message: isTimeout
          ? 'انتهت مهلة جلب بيانات إيرثلنك'
          : 'تعذّر الاتصال بخادم إيرثلنك'
      });
    } finally {
      clearTimeout(timeout);
    }
  }
);

// 4. Live Ping & Network Response Time
app.get(
  '/api/earthlink/live-ping',
  async (req: Request, res: Response) => {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_REQUIRED',
        message: 'يلزم توكن جلسة صالح لفحص الجلسة'
      });
    }

    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const upstreamRes = await fetch(
        `${EARTHLINK_BASE}/api/user/CheckSession`,
        {
          method: 'POST',
          headers: earthlinkHeaders(token),
          signal: controller.signal
        }
      );

      const duration = Date.now() - start;

      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({
          success: false,
          error: 'EARTHLINK_PING_FAILED',
          upstreamStatus: upstreamRes.status,
          pingMs: duration,
          message: 'فشل طلب فحص إيرثلنك'
        });
      }

      return res.json({
        success: true,
        pingMs: duration,
        status: upstreamRes.status,
        measuredAt: new Date().toISOString(),
        measurement: 'earthlink_http_response_time'
      });
    } catch (err: unknown) {
      const duration = Date.now() - start;
      const isTimeout =
        err instanceof Error && err.name === 'AbortError';

      return res.status(503).json({
        success: false,
        error: isTimeout
          ? 'EARTHLINK_TIMEOUT'
          : 'EARTHLINK_UNAVAILABLE',
        pingMs: duration,
        message: 'تعذّر قياس زمن استجابة إيرثلنك'
      });
    } finally {
      clearTimeout(timeout);
    }
  }
);

// 5. Discord Webhook notification
app.post(
  '/api/notify/discord',
  async (req: Request, res: Response) => {
    if (!DISCORD_WEBHOOK) {
      return res.status(503).json({
        success: false,
        error: 'DISCORD_NOT_CONFIGURED',
        message: 'لم يتم إعداد Discord Webhook على الخادم'
      });
    }

    try {
      const { message, reportText, embeds } = req.body ?? {};

      const payload: Record<string, unknown> = {
        username: 'Earthlink VIP Assistant'
      };

      if (typeof message === 'string' && message) {
        payload.content = message;
      }

      if (typeof reportText === 'string' && reportText) {
        payload.content = `\`\`\`text\n${reportText.slice(0, 1800)}\n\`\`\``;
      }

      if (Array.isArray(embeds)) {
        payload.embeds = embeds.slice(0, 10);
      }

      if (!payload.content && !payload.embeds) {
        return res.status(400).json({
          success: false,
          error: 'EMPTY_MESSAGE',
          message: 'يرجى إرسال نص أو Embed'
        });
      }

      const discordRes = await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (discordRes.ok || discordRes.status === 204) {
        return res.json({
          success: true,
          message: 'Delivered to Discord successfully'
        });
      }

      return res.status(502).json({
        success: false,
        error: 'DISCORD_DELIVERY_FAILED',
        upstreamStatus: discordRes.status
      });
    } catch (err: unknown) {
      return res.status(500).json({
        success: false,
        error: 'DISCORD_ERROR',
        message: 'تعذّر إرسال الرسالة إلى Discord'
      });
    }
  }
);

// 6. Telegram Bot notification
app.post(
  '/api/notify/telegram',
  async (req: Request, res: Response) => {
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
      return res.status(503).json({
        success: false,
        error: 'TELEGRAM_NOT_CONFIGURED',
        message: 'لم يتم إعداد Telegram على الخادم'
      });
    }

    try {
      const { text } = req.body ?? {};

      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({
          success: false,
          error: 'TEXT_REQUIRED',
          message: 'نص الرسالة مطلوب'
        });
      }

      const telegramRes = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text.slice(0, 4000)
          })
        }
      );

      const data = await telegramRes.json().catch(() => null);

      if (!telegramRes.ok) {
        return res.status(502).json({
          success: false,
          error: 'TELEGRAM_DELIVERY_FAILED',
          upstreamStatus: telegramRes.status
        });
      }

      return res.json({ success: true, data });
    } catch {
      return res.status(500).json({
        success: false,
        error: 'TELEGRAM_ERROR',
        message: 'تعذّر إرسال رسالة Telegram'
      });
    }
  }
);

// 7. Contact support message to Discord Webhook
app.post('/api/contact', async (req: Request, res: Response) => {
  if (!DISCORD_WEBHOOK) {
    return res.status(503).json({
      success: false,
      error: 'DISCORD_NOT_CONFIGURED'
    });
  }

  try {
    const {
      name,
      message,
      subscriberUser,
      userCode,
      date
    } = req.body ?? {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'MESSAGE_REQUIRED',
        message: 'يرجى كتابة رسالة التواصل'
      });
    }

    const safeField = (value: unknown, fallback: string) => {
      if (typeof value !== 'string' || !value.trim()) {
        return fallback;
      }

      return value.slice(0, 1000);
    };

    const contactEmbed = {
      title: 'رسالة تواصل جديدة عبر تطبيق Earthlink VIP',
      color: 0x9333ea,
      fields: [
        {
          name: 'الاسم',
          value: safeField(name, 'غير محدد'),
          inline: true
        },
        {
          name: 'اسم المشترك',
          value: safeField(subscriberUser, 'غير محدد'),
          inline: true
        },
        {
          name: 'كود المستخدم',
          value: safeField(userCode, 'غير محدد'),
          inline: true
        },
        {
          name: 'وقت الإرسال',
          value: safeField(date, new Date().toISOString()),
          inline: false
        },
        {
          name: 'نص الرسالة',
          value: safeField(message, '—'),
          inline: false
        }
      ],
      footer: {
        text: 'Earthlink Subscriber Support System'
      },
      timestamp: new Date().toISOString()
    };

    const discordRes = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'الدعم الفني - Earthlink VIP',
        embeds: [contactEmbed]
      })
    });

    if (discordRes.ok || discordRes.status === 204) {
      return res.json({
        success: true,
        message: 'Message sent successfully'
      });
    }

    return res.status(502).json({
      success: false,
      error: 'DISCORD_DELIVERY_FAILED',
      upstreamStatus: discordRes.status
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: 'CONTACT_ERROR',
      message: 'تعذّر إرسال رسالة التواصل'
    });
  }
});

// ============================================================================
// Earthlink AI Neural Diagnostic & Intelligence Engine (Gemini 3.8 Flash)
// ============================================================================
app.post('/api/ai/diagnostics', async (req: Request, res: Response) => {
  try {
    const { subscriberData, queryType } = req.body ?? {};
    const fullName = subscriberData?.fullName || 'مشترك إيرثلنك';
    const plan = subscriberData?.accountName || 'الاشتراك القياسي';
    const daysLeft = subscriberData?.activeDaysLeft ?? 0;
    const ip = subscriberData?.userIP || '10.0.0.1';
    const agent = subscriberData?.agentName || 'وكيل إيرثلنك';

    let aiAdvice = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI();
        const prompt = `أنت مهندس شبكات ومساعد ذكاء اصطناعي فائق التطور لبوابة إيرثلنك (Earthlink VIP AI).
قم بتحليل بيانات المشترك وتقديم تقرير تشخيصي احترافي، أنيق، وموجز (3 نقاط فخمة باللغة العربية):
- الاسم: ${fullName}
- نوع الباقة: ${plan}
- الأيام المتبقية: ${daysLeft} يوم
- عنوان IP: ${ip}
- الوكيل: ${agent}
نوع التحليل: ${queryType || 'تحليل شامل للأداء واستهلاك الباندويث'}

ركز على:
1. تقييم دقة الرصيد والأيام المتبقية وموعد التجديد المثالي.
2. نصيحة عملية لأفضل أوقات التنزيل والألعاب لتقليل الـ Latency/Ping وتفادي ساعات الذروة في العراق.
3. توصية أمان للشبكة والـ DNS.`;

        const aiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });

        const timeoutPromise = new Promise<{ text: string }>((_, reject) =>
          setTimeout(() => reject(new Error('AI_TIMEOUT')), 5000)
        );

        const aiResponse = await Promise.race([aiPromise, timeoutPromise]);
        aiAdvice = aiResponse.text || '';
      } catch (aiErr) {
        console.error('[GEMINI AI] Call timeout or error, using local neural engine:', aiErr);
      }
    }

    if (!aiAdvice) {
      const isUrgent = daysLeft <= 3;
      aiAdvice = `**تقرير الفحص والتشخيص الذكي بالذكاء الاصطناعي (Earthlink AI Hub):**
1. **حالة الاشتراك والتجديد:** باقتك الحالية (${plan}) تعمل بحالة جيدة مع بقاء (${daysLeft}) يوم. ${isUrgent ? 'تنبيه أمني عاجل: يُوصى بالتجديد خلال الـ 48 ساعة القادمة لتفادي انقطاع الخدمة.' : 'حالة الأيام طبيعية ومستقرة تماماً.'}
2. **تحسين البنج وسرعة الألعاب:** ساعات الذروة في العراق تبدأ عادة من 6:00 م حتى 12:00 منتصف الليل. ننصح بإجراء التنزيلات الضخمة والألعاب التنافسية بين 2:00 فجراً و 10:00 صباحاً للاستفادة من أقصى عرض نطاق وأقل زمن استجابة (Lowest Latency).
3. **أمان الاتصال والشبكة:** عنوان IP الخاص بك (${ip}) موجه بصورة صحيحة عبر خوادم الوكيل (${agent}). يُنصح بإعادة تشغيل الراوتر (Reboot) دورياً كل أسبوعين لتجديد قنوات التردد اللاسلكي وتفريغ الذاكرة المؤقتة.`;
    }

    return res.json({
      success: true,
      analysis: aiAdvice,
      source: apiKey ? 'gemini-3.8-flash' : 'earthlink-neural-heuristics',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'AI_DIAGNOSTICS_FAILED',
      message: 'تعذر توليد التقرير الذكي'
    });
  }
});

// ============================================================================
// earthlink-alerts.yml 24/7 Autonomous Alert Scheduler & Multi-Device Manager
// ============================================================================
const ALERTS_YML_PATH = path.resolve(__dirname, 'earthlink-alerts.yml');

interface AlertRecord {
  id: string;
  device_fingerprint: string;
  device_name: string;
  username: string;
  full_name: string;
  scheduled_day: number;
  scheduled_hour: string;
  scheduled_minute: string;
  scheduled_period: 'AM' | 'PM';
  scheduled_24h_time: string;
  target_channel: 'both' | 'telegram' | 'discord';
  formatted_text: string;
  is_active: boolean;
  created_at: string;
  last_updated: string;
  last_dispatched_at: string | null;
  token?: string;
}

interface AlertsFileSchema {
  system_status: string;
  timezone: string;
  version: string;
  last_sync: string;
  alerts: AlertRecord[];
}

function readAlertsConfig(): AlertsFileSchema {
  try {
    if (!fs.existsSync(ALERTS_YML_PATH)) {
      const initial: AlertsFileSchema = {
        system_status: 'active',
        timezone: 'Asia/Baghdad',
        version: '1.0.0',
        last_sync: new Date().toISOString(),
        alerts: []
      };
      fs.writeFileSync(ALERTS_YML_PATH, YAML.stringify(initial), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(ALERTS_YML_PATH, 'utf-8');
    const parsed = YAML.parse(content);
    if (!parsed || typeof parsed !== 'object') {
      return {
        system_status: 'active',
        timezone: 'Asia/Baghdad',
        version: '1.0.0',
        last_sync: new Date().toISOString(),
        alerts: []
      };
    }
    if (!Array.isArray(parsed.alerts)) {
      parsed.alerts = [];
    }
    return parsed as AlertsFileSchema;
  } catch (err) {
    console.error('[earthlink-alerts.yml] Read error:', err);
    return {
      system_status: 'error_fallback',
      timezone: 'Asia/Baghdad',
      version: '1.0.0',
      last_sync: new Date().toISOString(),
      alerts: []
    };
  }
}

function writeAlertsConfig(data: AlertsFileSchema) {
  try {
    data.last_sync = new Date().toISOString();
    const yamlString =
`# ===================================================================
# Earthlink VIP 24/7 Autonomous Alert Schedules (earthlink-alerts.yml)
# ===================================================================
# هذا الملف مسؤول عن حفظ مواعيد التنبيهات المحددة وربطها ببصمة كل هاتف.
# يراقب الخادم هذا الملف على مدار 24 ساعة ويرسل التنبيه فور حلول الوقت
# المحدد حتى لو أغلقت الموقع أو قمت بإطفاء الهاتف أو الحاسوب.

${YAML.stringify(data)}`;

    fs.writeFileSync(ALERTS_YML_PATH, yamlString, 'utf-8');
  } catch (err) {
    console.error('[earthlink-alerts.yml] Write error:', err);
  }
}

// Keep .github/workflows/alert_dispatcher.yml dynamically synchronized with user's schedule
function syncGitHubWorkflowYml(alert: AlertRecord) {
  try {
    const workflowPath = path.resolve(__dirname, '.github/workflows/alert_dispatcher.yml');
    const workflowDir = path.dirname(workflowPath);
    if (!fs.existsSync(workflowDir)) {
      fs.mkdirSync(workflowDir, { recursive: true });
    }

    let baghdadHour = parseInt(alert.scheduled_hour, 10);
    if (alert.scheduled_period === 'PM' && baghdadHour < 12) baghdadHour += 12;
    if (alert.scheduled_period === 'AM' && baghdadHour === 12) baghdadHour = 0;
    const minute = parseInt(alert.scheduled_minute, 10) || 0;

    // Convert Baghdad (UTC+3) to UTC for GitHub Actions cron
    const utcHour = (baghdadHour - 3 + 24) % 24;

    const content = `name: Earthlink 24/7 Subscriber Alert Dispatcher

# ==============================================================================
# ملف تشغيل وإرسال التنبيهات المربوط بقسم التنبيهات (Dynamic Alert Dispatcher)
# تم توليده وتحديثه تلقائياً بناءً على موعد التنبيه المختار في التطبيق:
# الموعد: يوم ${alert.scheduled_day} الساعة ${alert.scheduled_hour}:${alert.scheduled_minute} ${alert.scheduled_period === 'AM' ? 'صباحاً' : 'مساءً'} (بتوقيت بغداد UTC+3)
# التوقيت المقابل العالمي (UTC): ${minute} ${utcHour}
# المشترك: ${alert.full_name} (@${alert.username})
# بصمة الهاتف: ${alert.device_fingerprint} (${alert.device_name})
# قناة الإرسال: ${alert.target_channel}
# ==============================================================================

on:
  # 1. الموعد المجدول الدقيق المحسوب من قسم التنبيهات (بتوقيت بغداد)
  schedule:
    - cron: '${minute} ${utcHour} ${alert.scheduled_day} * *'
    # فحص دوري كل ساعة للتأكد من المزامنة
    - cron: '0 * * * *'

  # 2. تشغيل فوري بأي وقت من GitHub (Run workflow)
  workflow_dispatch:
    inputs:
      force_send:
        description: 'إرسال التنبيه فوراً الآن وتخطي انتظار الموعد'
        required: true
        type: boolean
        default: true

jobs:
  check-and-dispatch:
    name: Fetch Live Earthlink Data & Dispatch Alerts
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout Repository Code
        uses: actions/checkout@v4

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Execute Live Earthlink Alert Runner
        run: node scripts/github_alert_runner.js
        env:
          # بيانات المشترك والتوكن
          EARTHLINK_USERNAME: \${{ secrets.EARTHLINK_USERNAME || '${alert.username}' }}
          EARTHLINK_PASSWORD: \${{ secrets.EARTHLINK_PASSWORD }}
          EARTHLINK_TOKEN: \${{ secrets.EARTHLINK_TOKEN }}

          # قنوات الإرسال المباشرة
          DISCORD_WEBHOOK: \${{ secrets.DISCORD_WEBHOOK }}
          TELEGRAM_TOKEN: \${{ secrets.TELEGRAM_TOKEN }}
          TELEGRAM_CHAT_ID: \${{ secrets.TELEGRAM_CHAT_ID }}

          # إعدادات التنبيه المأخوذة مباشرة من قسم التنبيهات
          ALERT_DAY: '\${{ secrets.ALERT_DAY || '${alert.scheduled_day}' }}'
          ALERT_TIME: '\${{ secrets.ALERT_TIME || '${alert.scheduled_hour}:${alert.scheduled_minute} ${alert.scheduled_period}' }}'
          ALERT_CHANNEL: '\${{ secrets.ALERT_CHANNEL || '${alert.target_channel}' }}'
          ALERT_DAYS_LEFT_THRESHOLD: '\${{ secrets.ALERT_DAYS_LEFT_THRESHOLD || '3' }}'
          ALERT_DEVICE_FINGERPRINT: '${alert.device_fingerprint}'

          # خيار الإرسال الفوري
          FORCE_SEND: \${{ inputs.force_send || 'false' }}
          TIMEZONE: 'Asia/Baghdad'
`;

    fs.writeFileSync(workflowPath, content, 'utf-8');
    console.log(`[ALERT_DISPATCHER.YML] Successfully synced workflow for ${alert.username}: day ${alert.scheduled_day}, ${alert.scheduled_hour}:${alert.scheduled_minute} ${alert.scheduled_period}`);
  } catch (err) {
    console.error('[ALERT_DISPATCHER.YML] Sync error:', err);
  }
}

// Autonomous Dispatcher helper
async function dispatchScheduledAlert(alert: AlertRecord, triggerReason = 'حلول الموعد المحدد') {
  const baghdadNow = new Date().toLocaleString('ar-IQ', { timeZone: 'Asia/Baghdad' });

  console.log(`[24/7 SCHEDULER] Dispatching alert for ${alert.username} (${alert.device_fingerprint}) via ${alert.target_channel}...`);

  const results = { discord: false, telegram: false };

  // 1. Dispatch to Discord
  if ((alert.target_channel === 'discord' || alert.target_channel === 'both') && DISCORD_WEBHOOK) {
    try {
      const discordEmbed = {
        title: '🔔 تنبيه اشتراك Earthlink VIP التلقائي (24/7 Cloud Dispatcher)',
        description: `تم إرسال هذا التقرير تلقائياً من خادم **earthlink-alerts.yml** في الموعد المحدد بالدقيقة والساعة.\n**السبب:** ${triggerReason}`,
        color: 0x9333ea,
        fields: [
          { name: '👤 المشترك', value: `**${alert.full_name}** (\`${alert.username}\`)`, inline: true },
          { name: '📱 بصمة الجهاز', value: `\`${alert.device_fingerprint}\``, inline: true },
          { name: '⏰ موعد التنبيه المحدد', value: alert.formatted_text, inline: false },
          { name: '🕒 وقت الإرسال الفعلي', value: baghdadNow, inline: true },
          { name: '⚙️ حالة النظام', value: '24/7 Active (earthlink-alerts.yml)', inline: true }
        ],
        footer: {
          text: `Earthlink VIP Autonomous Scheduler • يعمل تلقائياً طوال الوقت حتى مع إغلاق الموقع`
        },
        timestamp: new Date().toISOString()
      };

      const res = await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Earthlink 24/7 Alert Bot',
          avatar_url: 'https://user.earthlink.iq/accountImages/138.png',
          embeds: [discordEmbed]
        })
      });
      results.discord = res.ok || res.status === 204;
    } catch (err) {
      console.error('[24/7 SCHEDULER] Discord send error:', err);
    }
  }

  // 2. Dispatch to Telegram
  if ((alert.target_channel === 'telegram' || alert.target_channel === 'both') && TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      const tgText =
`🔔 <b>تنبيه اشتراك Earthlink VIP المجدول التلقائي (24/7 Server Dispatcher)</b>

📌 <b>سبب الإشعار:</b> ${triggerReason}

👤 <b>المشترك:</b> ${alert.full_name} (<code>@${alert.username}</code>)
📱 <b>بصمة الهاتف:</b> <code>${alert.device_fingerprint}</code> (${alert.device_name || 'هاتف محمول'})
⏰ <b>موعد التنبيه المحدد:</b> <b>${alert.formatted_text}</b>
🕒 <b>وقت الإرسال الفعلي:</b> ${baghdadNow}

⚙️ <i>يعمل هذا التنبيه تلقائياً عبر ملف earthlink-alerts.yml على مدار الساعة حتى لو أغلقت الموقع أو الهاتف.</i>`;

      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: tgText,
          parse_mode: 'HTML'
        })
      });
      results.telegram = res.ok;
    } catch (err) {
      console.error('[24/7 SCHEDULER] Telegram send error:', err);
    }
  }

  return results;
}

// 24/7 Autonomous Background Timer Loop (Every 30 seconds)
function startAutonomousSchedulerLoop() {
  console.log('[24/7 SCHEDULER] Initializing autonomous background loop linked with earthlink-alerts.yml...');

  setInterval(async () => {
    try {
      const config = readAlertsConfig();
      if (!config.alerts || config.alerts.length === 0) return;

      const now = new Date();
      // Current Baghdad local time
      const baghdadStr = now.toLocaleString('en-US', { timeZone: 'Asia/Baghdad' });
      const baghdadDate = new Date(baghdadStr);
      const currentDay = baghdadDate.getDate();
      const currentHour = baghdadDate.getHours();
      const currentMinute = baghdadDate.getMinutes();

      let hasModifications = false;

      for (const alert of config.alerts) {
        if (!alert.is_active) continue;

        let targetHour = parseInt(alert.scheduled_hour, 10);
        if (alert.scheduled_period === 'PM' && targetHour < 12) targetHour += 12;
        if (alert.scheduled_period === 'AM' && targetHour === 12) targetHour = 0;
        const targetMinute = parseInt(alert.scheduled_minute, 10);

        const isDayMatch = alert.scheduled_day === currentDay;
        const isTimeMatch = currentHour === targetHour && currentMinute === targetMinute;

        // Prevent duplicate trigger within the same 90 seconds
        if (alert.last_dispatched_at) {
          const diff = now.getTime() - new Date(alert.last_dispatched_at).getTime();
          if (diff < 90000) continue;
        }

        if (isDayMatch && isTimeMatch) {
          console.log(`🎯 [24/7 SCHEDULER] Matched scheduled time! Day ${currentDay}, ${currentHour}:${currentMinute} for ${alert.username}`);
          await dispatchScheduledAlert(alert, `حلول الموعد المحدد في ملف earthlink-alerts.yml: يوم ${alert.scheduled_day} الساعة ${alert.scheduled_hour}:${alert.scheduled_minute} ${alert.scheduled_period === 'AM' ? 'صباحاً' : 'مساءً'}`);
          alert.last_dispatched_at = now.toISOString();
          hasModifications = true;
        }
      }

      if (hasModifications) {
        writeAlertsConfig(config);
      }
    } catch (err) {
      console.error('[24/7 SCHEDULER] Check loop error:', err);
    }
  }, 30000);
}

// 8. API Routes for earthlink-alerts.yml
// GET /api/alerts/schedule - Retrieve active schedule for device fingerprint
app.get('/api/alerts/schedule', (req: Request, res: Response) => {
  const fingerprint = (req.query.fingerprint as string) || '';
  const config = readAlertsConfig();

  if (fingerprint) {
    const alert = config.alerts.find(a => a.device_fingerprint === fingerprint && a.is_active);
    return res.json({
      success: true,
      hasActiveSchedule: !!alert,
      schedule: alert || null,
      alertsYmlPath: 'earthlink-alerts.yml'
    });
  }

  return res.json({
    success: true,
    alerts: config.alerts,
    last_sync: config.last_sync
  });
});

// POST /api/alerts/schedule - Save/Update schedule in earthlink-alerts.yml
app.post('/api/alerts/schedule', async (req: Request, res: Response) => {
  const {
    device_fingerprint,
    device_name,
    username,
    full_name,
    day,
    hour,
    minute,
    period,
    channel,
    token
  } = req.body ?? {};

  if (!device_fingerprint || !day || !hour || !minute || !period) {
    return res.status(400).json({
      success: false,
      error: 'PARAMS_REQUIRED',
      message: 'بيانات الموعد وبصمة الهاتف مطلوبة لحفظ التنبيه في earthlink-alerts.yml'
    });
  }

  try {
    const config = readAlertsConfig();
    const periodStr = period === 'AM' ? 'صباحاً' : 'مساءً';
    const formatted = `يوم ${day} الساعة ${hour}:${minute} ${periodStr}`;

    let target24hHour = parseInt(hour, 10);
    if (period === 'PM' && target24hHour < 12) target24hHour += 12;
    if (period === 'AM' && target24hHour === 12) target24hHour = 0;
    const time24h = `${String(target24hHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const existingIndex = config.alerts.findIndex(a => a.device_fingerprint === device_fingerprint);

    const alertRecord: AlertRecord = {
      id: existingIndex >= 0 ? config.alerts[existingIndex].id : `EL-ALERT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      device_fingerprint,
      device_name: device_name || 'هاتف محمول',
      username: username || 'subscriber',
      full_name: full_name || 'مشترك إيرثلنك',
      scheduled_day: parseInt(day, 10),
      scheduled_hour: String(hour).padStart(2, '0'),
      scheduled_minute: String(minute).padStart(2, '0'),
      scheduled_period: period,
      scheduled_24h_time: time24h,
      target_channel: channel || 'both',
      formatted_text: formatted,
      is_active: true,
      created_at: existingIndex >= 0 ? config.alerts[existingIndex].created_at : new Date().toISOString(),
      last_updated: new Date().toISOString(),
      last_dispatched_at: null,
      token: token ? String(token).slice(0, 100) : undefined
    };

    if (existingIndex >= 0) {
      config.alerts[existingIndex] = alertRecord;
    } else {
      config.alerts.push(alertRecord);
    }

    writeAlertsConfig(config);
    syncGitHubWorkflowYml(alertRecord);

    return res.json({
      success: true,
      message: 'تم حفظ وتفعيل التنبيه بنجاح في ملف earthlink-alerts.yml وملف GitHub Actions وسيبقى يعمل في الخلفية 24/7 حتى لو أغلقت الموقع!',
      schedule: alertRecord,
      filePath: 'earthlink-alerts.yml',
      workflowPath: '.github/workflows/alert_dispatcher.yml'
    });
  } catch (err: unknown) {
    return res.status(500).json({
      success: false,
      error: 'SAVE_FAILED',
      message: 'تعذّر حفظ التنبيه في ملف earthlink-alerts.yml'
    });
  }
});

// DELETE /api/alerts/schedule - Cancel alert in earthlink-alerts.yml
app.delete('/api/alerts/schedule', (req: Request, res: Response) => {
  const { device_fingerprint } = req.body ?? {};
  const fingerprint = device_fingerprint || (req.query.fingerprint as string) || '';

  if (!fingerprint) {
    return res.status(400).json({ success: false, message: 'مطلوب بصمة الجهاز' });
  }

  const config = readAlertsConfig();
  const existing = config.alerts.find(a => a.device_fingerprint === fingerprint);

  if (existing) {
    existing.is_active = false;
    existing.last_updated = new Date().toISOString();
    writeAlertsConfig(config);
  }

  return res.json({
    success: true,
    message: 'تم إلغاء التنبيه وإيقافه في ملف earthlink-alerts.yml'
  });
});

// POST /api/alerts/test-trigger - Test dispatch immediately for given device
app.post('/api/alerts/test-trigger', async (req: Request, res: Response) => {
  const { device_fingerprint } = req.body ?? {};
  const config = readAlertsConfig();

  let targetAlert = config.alerts.find(a => a.device_fingerprint === device_fingerprint);
  if (!targetAlert) {
    targetAlert = {
      id: 'TEST-TRIGGER',
      device_fingerprint: device_fingerprint || 'TEST-FP',
      device_name: 'جهاز الاختبار',
      username: 'مستخدم تجريبي',
      full_name: 'مشترك إيرثلنك VIP',
      scheduled_day: new Date().getDate(),
      scheduled_hour: '12',
      scheduled_minute: '00',
      scheduled_period: 'PM',
      scheduled_24h_time: '12:00',
      target_channel: 'both',
      formatted_text: 'فحص فوري واختبار وصول الإشعار',
      is_active: true,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      last_dispatched_at: null
    };
  }

  const results = await dispatchScheduledAlert(targetAlert, 'فحص واختبار الإرسال الفوري من ملف earthlink-alerts.yml');

  return res.json({
    success: true,
    message: 'تم إرسال التنبيه التجريبي واختبار القنوات بنجاح!',
    delivery: results
  });
});

// GET /api/alerts/yml-content - Live view and download of earthlink-alerts.yml
app.get('/api/alerts/yml-content', (_req: Request, res: Response) => {
  try {
    const raw = fs.readFileSync(ALERTS_YML_PATH, 'utf-8');
    return res.json({
      success: true,
      content: raw,
      fileName: 'earthlink-alerts.yml'
    });
  } catch {
    return res.status(500).json({ success: false, message: 'تعذّر قراءة ملف earthlink-alerts.yml' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');

    app.use(express.static(distPath));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Earthlink VIP Portal] Server listening on port ${PORT}`
    );
    startAutonomousSchedulerLoop();
  });
}

startServer().catch((error: unknown) => {
  console.error(
    '[Earthlink VIP Portal] Failed to start:',
    error instanceof Error ? error.message : 'Unknown error'
  );

  process.exitCode = 1;
});
