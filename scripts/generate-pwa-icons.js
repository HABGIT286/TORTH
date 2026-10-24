import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng(size, isMaskable = false) {
  // RGBA raw buffer: size * (1 + size * 4)
  const rowLen = 1 + size * 4;
  const raw = Buffer.alloc(size * rowLen);

  const center = size / 2;
  const radius = size * 0.44;
  const innerRadius = size * 0.38;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowLen;
    raw[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background gradient (Royal Earthlink purple to cyan/slate)
      const gradT = y / size;
      let r = Math.round(15 + 110 * (1 - gradT));
      let g = Math.round(5 + 30 * (1 - gradT));
      let b = Math.round(30 + 190 * (1 - gradT));
      let a = 255;

      // Rounded squircle or circle container
      const isInsideAppCard = dist <= radius;
      if (!isMaskable && !isInsideAppCard) {
        a = 0;
      }

      // Draw stylized Earthlink emblem (glowing signal arch & sphere)
      if (dist < radius && dist >= innerRadius - 4) {
        // Glowing cyan/purple border ring
        r = Math.min(255, r + 130);
        g = Math.min(255, g + 80);
        b = Math.min(255, b + 210);
      }

      // Center glowing emblem (WiFi arcs / Fiber pulse)
      const r1 = size * 0.22;
      const r2 = size * 0.15;
      const r3 = size * 0.08;

      const angle = Math.atan2(dy, dx);
      // Top hemisphere arcs
      if (angle < -0.3 && angle > -2.84) {
        if (Math.abs(dist - r1) < size * 0.035 || Math.abs(dist - r2) < size * 0.035) {
          r = 34;
          g = 211;
          b = 238; // Cyan 400
          a = 255;
        }
      }

      // Center pulse dot
      if (dist <= r3) {
        r = 168;
        g = 85;
        b = 247; // Purple 500
        a = 255;
      }

      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression: 0
  ihdrData[11] = 0; // Filter: 0
  ihdrData[12] = 0; // Interlace: 0
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PNGs
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePng(64, false));

console.log('Generated all PWA icons successfully in /public');
