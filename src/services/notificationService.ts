/**
 * Hybrid Notification Service (السيرفر + GitHub Pages الحية)
 * يضمن إرسال إشعارات الديسكورد وتليجرام في الحالتين:
 * 1. عند تشغيل المشروع بسيرفر Node.js (عبر /api/notify/*)
 * 2. عند تشغيل الموقع مباشرة على GitHub Pages (إرسال مباشر عبر CORS مع Webhook / Telegram Bot API)
 */

export const DEFAULT_DISCORD_WEBHOOK =
  'https://discord.com/api/webhooks/1555280750654398528/m7pjebcPl7DL95_KdyoEDcHspnG9Rk3mOfITsMhMJcgtGfave55W_LQQZ6pk0nDEfcIt';

export const DEFAULT_TELEGRAM_TOKEN =
  '8873866209:AAExp-CQKB8-6WDARWcotQKm8HUEpIomeKM';

export const DEFAULT_TELEGRAM_CHAT_ID = '7753969972';

export interface DiscordNotifyOptions {
  message: string;
  reportText?: string;
  webhookUrl?: string;
}

export interface TelegramNotifyOptions {
  text: string;
  botToken?: string;
  chatId?: string;
}

/**
 * إرسال تنبيه عبر ديسكورد (يدعم السيرفر و GitHub Pages)
 */
export async function sendDiscordNotification(options: DiscordNotifyOptions): Promise<boolean> {
  const webhook = options.webhookUrl?.trim() || DEFAULT_DISCORD_WEBHOOK;
  const payload = {
    content: options.message,
    username: 'Earthlink VIP Monitor',
    avatar_url: 'https://user.earthlink.iq/accountImages/138.png'
  };

  // Tier 1: المحاولة عبر السيرفر المحلي (إن كان متاحاً)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('/api/notify/discord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: options.message,
        reportText: options.reportText,
        webhookUrl: webhook
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (res.ok) return true;
  } catch {
    // السيرفر غير متواجد (GitHub Pages) أو حدثت مهلة - ننتقل للإرسال المباشر
  }

  // Tier 2: الإرسال المباشر من المتصفح (يعمل 100% على GitHub Pages)
  try {
    const directRes = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return directRes.ok || directRes.status === 204;
  } catch (err) {
    console.warn('Direct Discord dispatch failed on GitHub Pages:', err);
    return false;
  }
}

/**
 * إرسال تنبيه عبر تليجرام (يدعم السيرفر و GitHub Pages)
 */
export async function sendTelegramNotification(options: TelegramNotifyOptions): Promise<boolean> {
  const token = options.botToken?.trim() || DEFAULT_TELEGRAM_TOKEN;
  const chat = options.chatId?.trim() || DEFAULT_TELEGRAM_CHAT_ID;

  // Tier 1: المحاولة عبر السيرفر المحلي
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('/api/notify/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: options.text,
        botToken: token,
        chatId: chat
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (res.ok) return true;
  } catch {
    // السيرفر غير متواجد (GitHub Pages)
  }

  // Tier 2: الإرسال المباشر عبر Telegram Bot API (يدعم المتصفح بـ CORS)
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: options.text,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    return !!data.ok;
  } catch (err) {
    console.warn('Direct Telegram dispatch failed on GitHub Pages:', err);
    return false;
  }
}
