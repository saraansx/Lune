// generate-thumbar-icons.js
// Run with: node scripts/generate-thumbar-icons.js
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcVal]);
}

function createPNG(W, H, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0;
    for (let x = 0; x < W; x++) {
      const si = (y * W + x) * 4;
      const di = y * (1 + W * 4) + 1 + x * 4;
      raw[di] = pixels[si]; raw[di+1] = pixels[si+1]; raw[di+2] = pixels[si+2]; raw[di+3] = pixels[si+3];
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, makeChunk('IHDR', ihdr), makeChunk('IDAT', idat), makeChunk('IEND', Buffer.alloc(0))]);
}

const W = 20, H = 20;
function blank() { return new Uint8Array(W * H * 4); }
function set(p, x, y, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  p[i] = 255; p[i+1] = 255; p[i+2] = 255; p[i+3] = a;
}
function fillRect(p, x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(p, x, y);
}

// ── PLAY (right-pointing triangle) ──────────────────────────────
function makePlay() {
  const p = blank();
  for (let y = 0; y < H; y++) {
    const half = H / 2;
    const dist = Math.abs(y - (half - 0.5));
    const right = W - 4;
    const left = 4;
    const span = right - left;
    const endX = right - Math.round((dist / half) * span);
    for (let x = left; x <= endX; x++) set(p, x, y);
  }
  return p;
}

// ── PAUSE (two vertical bars) ────────────────────────────────────
function makePause() {
  const p = blank();
  fillRect(p, 5, 4, 8, H - 5);
  fillRect(p, 11, 4, 14, H - 5);
  return p;
}

// ── PREV (skip-back: bar + left triangle) ────────────────────────
function makePrev() {
  const p = blank();
  // left bar
  fillRect(p, 4, 4, 6, H - 5);
  // left-pointing triangle
  for (let y = 0; y < H; y++) {
    const half = H / 2;
    const dist = Math.abs(y - (half - 0.5));
    const left = 8;
    const span = 8;
    const startX = left + Math.round((dist / half) * span);
    for (let x = startX; x <= left + span; x++) set(p, x, y);
  }
  return p;
}

// ── NEXT (skip-forward: right triangle + bar) ────────────────────
function makeNext() {
  const p = blank();
  // right-pointing triangle
  for (let y = 0; y < H; y++) {
    const half = H / 2;
    const dist = Math.abs(y - (half - 0.5));
    const left = 4;
    const span = 8;
    const endX = left + span - Math.round((dist / half) * span);
    for (let x = left; x <= endX; x++) set(p, x, y);
  }
  // right bar
  fillRect(p, 14, 4, 16, H - 5);
  return p;
}

const outDir = path.join(__dirname, '..', 'src', 'assets', 'thumbar');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'prev.png'), createPNG(W, H, makePrev()));
fs.writeFileSync(path.join(outDir, 'play.png'), createPNG(W, H, makePlay()));
fs.writeFileSync(path.join(outDir, 'pause.png'), createPNG(W, H, makePause()));
fs.writeFileSync(path.join(outDir, 'next.png'), createPNG(W, H, makeNext()));
console.log('✅ Thumbar icons generated in src/assets/thumbar/');
