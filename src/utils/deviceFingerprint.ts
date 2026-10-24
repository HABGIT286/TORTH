/**
 * Device Fingerprint Generator
 * ينشئ مفتاح بصمة فريد وثابت لكل هاتف أو متصفح
 * لربطه مع ملف earthlink-alerts.yml على الخادم
 */

export interface DeviceInfo {
  fingerprint: string;
  deviceName: string;
  platform: string;
}

export function getDeviceFingerprint(): DeviceInfo {
  let fingerprint = '';
  try {
    fingerprint = localStorage.getItem('EL_DEVICE_FINGERPRINT') || '';
  } catch {
    fingerprint = '';
  }

  if (!fingerprint) {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestampHex = Date.now().toString(36).slice(-4).toUpperCase();
    fingerprint = `FP-${timestampHex}-${randomHex}`;
    try {
      localStorage.setItem('EL_DEVICE_FINGERPRINT', fingerprint);
    } catch {
      // Handled
    }
  }

  let deviceName = 'هاتف ذكي / جهاز محمول';
  let platform = 'Mobile/Web';

  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) {
      deviceName = 'Apple iPhone (iOS)';
      platform = 'iOS';
    } else if (/iPad/i.test(ua)) {
      deviceName = 'Apple iPad';
      platform = 'iPadOS';
    } else if (/Android/i.test(ua)) {
      deviceName = 'Android Device (Samsung/Xiaomi)';
      platform = 'Android';
    } else if (/Windows/i.test(ua)) {
      deviceName = 'Windows PC (Desktop)';
      platform = 'Windows';
    } else if (/Macintosh|Mac OS/i.test(ua)) {
      deviceName = 'Apple Mac (macOS)';
      platform = 'macOS';
    }
  }

  return {
    fingerprint,
    deviceName,
    platform
  };
}
