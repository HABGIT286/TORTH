#!/usr/bin/env node
/**
 * Earthlink 24/7 Automated Alert Dispatcher (GitHub Actions Runner)
 * 
 * هذا الملف يعمل في بيئة GitHub Actions على مدار الساعة (24/7)
 * حتى لو أغلقت موقع إيرثلنك أو أغلقت هاتفك وحاسوبك.
 * 
 * الوظائف:
 * 1. تسجيل الدخول المباشر إلى خوادم إيرثلنك الحقيقية (ubapi.earthlink.iq).
 * 2. جلب أحدث بيانات المشترك (الأيام المتبقية، تاريخ الانتهاء، الباقة، IP، الوكيل).
 * 3. فحص شرط الموعد المجدول (اليوم، الساعة، أو عتبة الأيام المتبقية).
 * 4. إرسال التقرير الكامل والتنبيه المباشر إلى ديسكورد (Discord Webhook) وتليجرام (Telegram Bot).
 */

const EARTHLINK_BASE = 'https://ubapi.earthlink.iq';

// Configuration from Environment / GitHub Secrets
const USERNAME = process.env.EARTHLINK_USERNAME || '';
const PASSWORD = process.env.EARTHLINK_PASSWORD || '';
let BEARER_TOKEN = process.env.EARTHLINK_TOKEN || '';

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || '';
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// Schedule Settings
const ALERT_DAY = process.env.ALERT_DAY ? parseInt(process.env.ALERT_DAY, 10) : null;
const ALERT_TIME = process.env.ALERT_TIME || ''; // e.g. "08:30 PM" or "20:30"
const ALERT_CHANNEL = (process.env.ALERT_CHANNEL || 'both').toLowerCase(); // 'both' | 'discord' | 'telegram'
const ALERT_DAYS_THRESHOLD = process.env.ALERT_DAYS_LEFT_THRESHOLD ? parseInt(process.env.ALERT_DAYS_LEFT_THRESHOLD, 10) : null;
const FORCE_SEND = process.env.FORCE_SEND === 'true' || process.env.INPUT_FORCE_SEND === 'true';
const TIMEZONE = process.env.TIMEZONE || 'Asia/Baghdad';

const COMMON_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
  'Origin': 'https://user.earthlink.iq',
  'Referer': 'https://user.earthlink.iq/',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
};

function getBaghdadDate() {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
}

function parseTargetTime(timeStr) {
  if (!timeStr) return null;
  // formats: "08:30 PM", "8:30 PM", "20:30", "08:30", "8"
  const isPM = /PM/i.test(timeStr);
  const isAM = /AM/i.test(timeStr);
  const clean = timeStr.replace(/(AM|PM)/gi, '').trim();
  const parts = clean.split(':').map(p => parseInt(p, 10));
  let hour = parts[0] || 0;
  const minute = parts[1] || 0;

  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  return { hour, minute };
}

// 1. Authenticate with Earthlink
async function loginToEarthlink() {
  if (!USERNAME || !PASSWORD) {
    if (BEARER_TOKEN) {
      console.log('ℹ️ Using provided EARTHLINK_TOKEN secret directly.');
      return BEARER_TOKEN;
    }
    throw new Error('❌ Missing EARTHLINK_USERNAME and EARTHLINK_PASSWORD in repository secrets.');
  }

  console.log(`🔐 Authenticating with Earthlink API for user: ${USERNAME.slice(0, 3)}***...`);

  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('username', USERNAME.trim());
  formData.append('password', PASSWORD);
  formData.append('Logintype', '0');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${EARTHLINK_BASE}/api/user/Token`, {
      method: 'POST',
      headers: {
        ...COMMON_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body: formData.toString(),
      signal: controller.signal
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Failed to parse Earthlink Token response: ${text.slice(0, 100)}`);
    }

    if (!res.ok || !data.access_token) {
      const msg = data?.error_description || data?.message || data?.error || `HTTP ${res.status}`;
      throw new Error(`Earthlink login rejected: ${msg}`);
    }

    console.log('✅ Authenticated successfully with live Earthlink API.');
    return data.access_token;
  } finally {
    clearTimeout(timeout);
  }
}

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

function isHiddenKey(key) {
  const lower = String(key).toLowerCase();
  return SECRET_WORDS.some(w => lower.includes(w));
}

function parseDateValue(value) {
  if (typeof value === 'number') {
    let stamp = value;
    if (stamp > 10000000000) stamp /= 1000;
    if (stamp > 0) {
      const d = new Date(stamp * 1000);
      if (!isNaN(d.getTime())) return d;
    }
  }

  if (typeof value !== 'string') return null;
  const str = value.trim();

  const iso = new Date(str.replace(/Z$/i, '+00:00'));
  if (!isNaN(iso.getTime()) && str.length >= 8) return iso;

  const m1 = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m1) {
    const y = parseInt(m1[1], 10);
    const m = parseInt(m1[2], 10) - 1;
    const d = parseInt(m1[3], 10);
    const dObj = new Date(y, m, d);
    if (!isNaN(dObj.getTime())) return dObj;
  }

  const m2 = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m2) {
    const y = parseInt(m2[3], 10);
    const p1 = parseInt(m2[1], 10);
    const p2 = parseInt(m2[2], 10);
    const dObj = new Date(y, p2 - 1, p1);
    if (!isNaN(dObj.getTime())) return dObj;
  }

  return null;
}

function findExpiry(data, prefix = '') {
  const found = [];
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [key, val] of Object.entries(data)) {
      const label = prefix ? `${prefix} / ${key}` : key;
      const normalized = key.toLowerCase().replace(/[\s_-]+/g, '');

      const isExpiryField = EXPIRY_WORDS.some(word =>
        normalized.includes(word.toLowerCase().replace(/[\s_-]+/g, ''))
      );

      if (isExpiryField) {
        let raw = val;
        if (val && typeof val === 'object') {
          raw = val.value !== undefined ? val.value : val.displayName;
        }
        const parsed = parseDateValue(raw);
        if (parsed) {
          found.push({ label, date: parsed, raw: String(raw) });
        }
      }

      if (val && typeof val === 'object' && !Array.isArray(val)) {
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

function valueText(val) {
  if (val && typeof val === 'object') {
    if ('value' in val) return valueText(val.value);
    if ('displayName' in val) return valueText(val.displayName);
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) return val.map(v => valueText(v)).join(', ');
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'نعم' : 'لا';
  return String(val).trim();
}

function collectFields(data, prefix = '') {
  const rows = [];
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [key, val] of Object.entries(data)) {
      if (isHiddenKey(key)) continue;
      const label = prefix ? `${prefix} / ${key}` : key;

      if (val && typeof val === 'object' && ('value' in val || 'displayName' in val)) {
        const name = String(val.displayName || key);
        const actual = val.value;
        if (actual !== null && actual !== undefined && String(actual).trim()) {
          rows.push({ label: name, value: valueText(actual) });
        }
        const ignored = new Set(['value', 'displayName', 'editable', 'visible', 'tags', 'filedType', 'fieldType']);
        for (const [subkey, subval] of Object.entries(val)) {
          if (ignored.has(subkey) || isHiddenKey(subkey)) continue;
          if (subval !== null && subval !== undefined && subval !== '' && !Array.isArray(subval)) {
            rows.push(...collectFields({ [subkey]: subval }, name));
          }
        }
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        rows.push(...collectFields(val, label));
      } else if (Array.isArray(val)) {
        if (val.every(item => typeof item !== 'object')) {
          rows.push({ label, value: val.join(', ') });
        } else {
          val.forEach((item, i) => rows.push(...collectFields(item, `${label} #${i + 1}`)));
        }
      } else if (val !== null && val !== undefined && val !== '') {
        rows.push({ label, value: String(val).trim() });
      }
    }
  }
  return rows;
}

// 2. Fetch live subscriber data (Session Check + GetUserDataAr + Dynamic Days)
async function fetchSubscriberData(token) {
  console.log('📡 Verifying session & fetching live subscriber account data...');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    // Step A: Session Check (like fetch_account in Python)
    const sessionRes = await fetch(`${EARTHLINK_BASE}/api/user/CheckSession`, {
      method: 'POST',
      headers: {
        ...COMMON_HEADERS,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({}),
      signal: controller.signal
    });

    if (sessionRes.status === 401 || sessionRes.status === 403) {
      throw new Error('❌ Earthlink session rejected or expired. Please re-login.');
    }

    if (!sessionRes.ok) {
      throw new Error(`Session check failed with HTTP ${sessionRes.status}`);
    }

    // Step B: Get User Data
    const res = await fetch(`${EARTHLINK_BASE}/api/user/GetUserDataAr`, {
      method: 'GET',
      headers: {
        ...COMMON_HEADERS,
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Failed to parse GetUserDataAr response: ${text.slice(0, 100)}`);
    }

    if (!res.ok) {
      throw new Error(`Earthlink GetUserDataAr failed with status: ${res.status}`);
    }

    let payload = data;
    for (const k of ['data', 'result', 'userData', 'account', 'payload']) {
      const nested = data && typeof data === 'object' ? data[k] : null;
      if (nested && typeof nested === 'object' && Object.keys(data).length <= 5) {
        payload = nested;
        break;
      }
    }

    const fields = collectFields(payload);
    const expiries = findExpiry(payload);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let activeDaysLeft = null;
    let formattedExpirationDate = '';

    if (expiries.length > 0) {
      const { date: expDate, raw } = expiries[0];
      formattedExpirationDate = raw || expDate.toISOString().split('T')[0];
      const expMidnight = new Date(expDate);
      expMidnight.setHours(0, 0, 0, 0);
      activeDaysLeft = Math.round((expMidnight.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    const getVal = (key, fallback = '—') => {
      const obj = payload[key];
      if (obj !== undefined) {
        if (obj && typeof obj === 'object' && obj.value !== undefined) return String(obj.value);
        return String(obj);
      }
      const found = fields.find(f => f.label.toLowerCase().includes(key.toLowerCase()));
      if (found) return found.value;
      return fallback;
    };

    if (activeDaysLeft === null) {
      const daysVal = parseInt(getVal('activeDaysLeft', '0'), 10);
      activeDaysLeft = isNaN(daysVal) ? 0 : daysVal;
    }

    const subscriber = {
      fullName: getVal('fullName', 'مشترك إيرثلنك'),
      userID: getVal('userID', USERNAME || 'EarthlinkUser'),
      accountName: getVal('accountName', 'باقة إيرثلنك القياسية'),
      accountPrice: getVal('accountPrice', '35,000 د.ع'),
      accountStatus: getVal('accountStatus', 'مفعل'),
      activeDaysLeft,
      accountExpirationDate: formattedExpirationDate || getVal('accountExpirationDate', '—'),
      agentName: getVal('agentName', 'وكيل إيرثلنك المعتمد'),
      userIP: getVal('userIP', '—'),
      mobileNumber: getVal('mobileNumber', '—'),
      city: getVal('city', 'العراق'),
      address: getVal('address', '—'),
      allFields: fields
    };

    console.log('--------------------------------------------------');
    console.log('       EARTHLINK LIVE ACCOUNT DATA (CONNECTED)   ');
    console.log('--------------------------------------------------');
    console.log(`👤 المشترك: ${subscriber.fullName} (${subscriber.userID})`);
    console.log(`📦 الباقة: ${subscriber.accountName} | السعر: ${subscriber.accountPrice}`);
    console.log(`⏳ الأيام المتبقية: ${subscriber.activeDaysLeft} يوم`);
    console.log(`📅 تاريخ الانتهاء: ${subscriber.accountExpirationDate}`);
    console.log(`🌐 الـ IP: ${subscriber.userIP} | الوكيل: ${subscriber.agentName}`);
    console.log('--------------------------------------------------');

    return subscriber;
  } finally {
    clearTimeout(timeout);
  }
}

// 3. Check whether schedule conditions match
function checkScheduleConditions(subscriber) {
  if (FORCE_SEND) {
    console.log('⚡ FORCE_SEND is enabled. Dispatching alert immediately!');
    return { shouldSend: true, reason: 'تشغيل يدوي فوري (Force Send)' };
  }

  const baghdadNow = getBaghdadDate();
  const currentDay = baghdadNow.getDate();
  const currentHour = baghdadNow.getHours();
  const currentMinute = baghdadNow.getMinutes();

  console.log(`🕒 Current Baghdad Local Time: Day ${currentDay}, ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);

  // Condition A: Threshold of days left
  if (ALERT_DAYS_THRESHOLD !== null && subscriber.activeDaysLeft <= ALERT_DAYS_THRESHOLD) {
    return {
      shouldSend: true,
      reason: `تنبيه قرب انتهاء الاشتراك: تبقى ${subscriber.activeDaysLeft} أيام فقط (أقل من أو يساوي الحد ${ALERT_DAYS_THRESHOLD} أيام)`
    };
  }

  // Condition B: Specific scheduled Day of Month
  if (ALERT_DAY !== null) {
    if (currentDay !== ALERT_DAY) {
      console.log(`⏳ Today is day ${currentDay}, but scheduled day is ${ALERT_DAY}. Waiting for target day.`);
      return { shouldSend: false };
    }

    // Check specific Hour if provided
    if (ALERT_TIME) {
      const targetTime = parseTargetTime(ALERT_TIME);
      if (targetTime) {
        // GitHub Actions cron typically runs once per hour (e.g. 0 * * * *)
        // If current hour matches target hour:
        if (currentHour === targetTime.hour) {
          return {
            shouldSend: true,
            reason: `حلول الموعد المحدد: يوم ${ALERT_DAY} الساعة ${ALERT_TIME}`
          };
        } else {
          console.log(`⏳ Target hour is ${targetTime.hour}:00, current hour is ${currentHour}:00. Waiting for target hour.`);
          return { shouldSend: false };
        }
      }
    }

    return {
      shouldSend: true,
      reason: `حلول اليوم المحدد: يوم ${ALERT_DAY} من الشهر`
    };
  }

  // If no day/threshold is configured, dispatch by default so user gets their periodic update
  return {
    shouldSend: true,
    reason: 'تحديث دوري مجدول لبيانات الاشتراك'
  };
}

// 4. Dispatch to Discord
async function sendToDiscord(subscriber, reason) {
  if (!DISCORD_WEBHOOK) {
    console.log('⚠️ Discord webhook not configured in secrets. Skipping Discord.');
    return;
  }

  console.log('🚀 Sending rich alert embed to Discord Webhook...');

  const embed = {
    title: '🔔 تنبيه اشتراك Earthlink VIP التلقائي (GitHub Actions 24/7)',
    description: `تم إرسال هذا التنبيه تلقائياً عبر سحابة GitHub Actions للحفاظ على التذكير حتى مع إغلاق الموقع أو انقطاع الهاتف.\n**السبب:** ${reason}`,
    color: 0x9333ea, // Purple brand color
    fields: [
      { name: '👤 المشترك', value: `**${subscriber.fullName}** (\`${subscriber.userID}\`)`, inline: true },
      { name: '📦 الباقة والسعر', value: `${subscriber.accountName}\n\`${subscriber.accountPrice}\``, inline: true },
      { name: '⏳ الأيام المتبقية', value: `🚨 **${subscriber.activeDaysLeft} يوم**`, inline: true },
      { name: '📅 تاريخ الانتهاء', value: `\`${subscriber.accountExpirationDate}\``, inline: true },
      { name: '🏢 الوكيل', value: subscriber.agentName, inline: true },
      { name: '🌐 عنوان IP', value: `\`${subscriber.userIP}\``, inline: true },
      { name: '📱 رقم الهاتف', value: subscriber.mobileNumber || '—', inline: true },
      { name: '📍 الموقع', value: subscriber.city || 'العراق', inline: true }
    ],
    footer: {
      text: `Earthlink VIP Autonomous Scheduler • توقيت بغداد: ${new Date().toLocaleString('ar-IQ', { timeZone: TIMEZONE })}`
    },
    timestamp: new Date().toISOString()
  };

  const res = await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Earthlink 24/7 Bot',
      avatar_url: 'https://user.earthlink.iq/accountImages/138.png',
      embeds: [embed]
    })
  });

  if (res.ok || res.status === 204) {
    console.log('✅ Discord notification delivered successfully!');
  } else {
    const errorText = await res.text();
    console.error(`❌ Discord delivery failed with status ${res.status}:`, errorText);
  }
}

// 5. Dispatch to Telegram
async function sendToTelegram(subscriber, reason) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('⚠️ Telegram bot credentials not configured in secrets. Skipping Telegram.');
    return;
  }

  console.log('🚀 Sending formatted notification to Telegram Bot...');

  const baghdadTimeStr = new Date().toLocaleString('ar-IQ', { timeZone: TIMEZONE });

  const text = 
`🔔 <b>تنبيه اشتراك Earthlink VIP التلقائي (GitHub Actions 24/7)</b>

📌 <b>سبب الإشعار:</b> ${reason}

👤 <b>المشترك:</b> ${subscriber.fullName} (<code>@${subscriber.userID}</code>)
📦 <b>الباقة:</b> ${subscriber.accountName} (<b>${subscriber.accountPrice}</b>)
⏳ <b>الأيام المتبقية:</b> 🚨 <b>${subscriber.activeDaysLeft} يوم</b>
📅 <b>تاريخ الانتهاء:</b> <code>${subscriber.accountExpirationDate}</code>
🏢 <b>اسم الوكيل:</b> ${subscriber.agentName}
🌐 <b>عنوان الـ IP:</b> <code>${subscriber.userIP}</code>
📱 <b>الهاتف:</b> <code>${subscriber.mobileNumber}</code>
⏰ <b>وقت الإرسال:</b> ${baghdadTimeStr}

⚙️ <i>يعمل هذا التنبيه تلقائياً عبر مستودع GitHub الخاص بك على مدار 24 ساعة حتى لو خرجت من الموقع.</i>`;

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    })
  });

  if (res.ok) {
    console.log('✅ Telegram notification delivered successfully!');
  } else {
    const errorText = await res.text();
    console.error(`❌ Telegram delivery failed with status ${res.status}:`, errorText);
  }
}

// Main execution flow
async function main() {
  console.log('====================================================');
  console.log('   EARTHLINK 24/7 AUTONOMOUS ALERT DISPATCHER      ');
  console.log('====================================================');

  try {
    const token = await loginToEarthlink();
    const subscriber = await fetchSubscriberData(token);

    const condition = checkScheduleConditions(subscriber);

    if (!condition.shouldSend) {
      console.log('💤 Scheduled condition not reached yet. Workflow completed quietly.');
      return;
    }

    console.log(`🎯 Condition triggered: ${condition.reason}`);

    if (ALERT_CHANNEL === 'discord' || ALERT_CHANNEL === 'both') {
      await sendToDiscord(subscriber, condition.reason);
    }

    if (ALERT_CHANNEL === 'telegram' || ALERT_CHANNEL === 'both') {
      await sendToTelegram(subscriber, condition.reason);
    }

    console.log('✨ All scheduled alerts processed successfully.');
  } catch (err) {
    console.error('💥 Error running Earthlink alert dispatcher:', err.message);
    process.exit(1);
  }
}

main();
