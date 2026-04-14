// generate-thumbar-icons.cjs
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ── CRC32 ───────────────────────────────────────────────────────
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
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const l = Buffer.alloc(4); l.writeUInt32BE(data.length);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([l, t, data, c]);
}
function toPNG(W, H, px) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const hdr = Buffer.alloc(13);
  hdr.writeUInt32BE(W,0); hdr.writeUInt32BE(H,4); hdr[8]=8; hdr[9]=6;
  const raw = Buffer.alloc(H*(1+W*4));
  for (let y=0;y<H;y++){
    raw[y*(1+W*4)]=0;
    for(let x=0;x<W;x++){
      const si=(y*W+x)*4, di=y*(1+W*4)+1+x*4;
      raw[di]=px[si]; raw[di+1]=px[si+1]; raw[di+2]=px[si+2]; raw[di+3]=px[si+3];
    }
  }
  return Buffer.concat([sig, chunk('IHDR',hdr), chunk('IDAT',zlib.deflateSync(raw,{level:9})), chunk('IEND',Buffer.alloc(0))]);
}

const W = 32, H = 32;
function blank() { return new Uint8Array(W * H * 4); }

function setA(p, x, y, a) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || x >= W || y < 0 || y >= H || a <= 0) return;
  const i = (y * W + x) * 4;
  p[i] = 255; p[i+1] = 255; p[i+2] = 255;
  p[i+3] = Math.min(255, p[i+3] + Math.round(a));
}
function fill(p, x0, y0, x1, y1) {
  for (let y = Math.round(y0); y <= Math.round(y1); y++)
    for (let x = Math.round(x0); x <= Math.round(x1); x++)
      setA(p, x, y, 255);
}

// Anti-aliased solid right-pointing triangle
// Apex at (rx, cy), base at x=lx, half-height = halfH
function rightTri(p, lx, cy, rx, halfH) {
  for (let y = 0; y < H; y++) {
    const fy = y + 0.5;
    const dist = Math.abs(fy - cy);
    if (dist >= halfH) continue;
    const ratio = 1 - dist / halfH;
    const edgeX = lx + (rx - lx) * ratio; // right slanted edge
    for (let x = Math.floor(lx); x < Math.ceil(edgeX + 1); x++) {
      if (x >= W) break;
      const fx = x + 0.5;
      // coverage on right slanted edge
      const cov = Math.min(1, Math.max(0, edgeX - fx + 1));
      setA(p, x, y, Math.round(cov * 255));
    }
  }
}

// Anti-aliased solid left-pointing triangle
// Apex at (lx, cy), base at x=rx, half-height = halfH
function leftTri(p, lx, cy, rx, halfH) {
  for (let y = 0; y < H; y++) {
    const fy = y + 0.5;
    const dist = Math.abs(fy - cy);
    if (dist >= halfH) continue;
    const ratio = 1 - dist / halfH;
    const edgeX = rx - (rx - lx) * ratio; // left slanted edge
    for (let x = Math.ceil(edgeX - 1); x <= Math.round(rx); x++) {
      if (x < 0) continue;
      const fx = x + 0.5;
      const cov = Math.min(1, Math.max(0, fx - edgeX + 1));
      setA(p, x, y, Math.round(cov * 255));
    }
  }
}

// ── PLAY ▶ ──────────────────────────────────────────────────────
function makePlay() {
  const p = blank();
  rightTri(p, 10, 16, 23, 10);
  return p;
}

// ── PAUSE ⏸ ─────────────────────────────────────────────────────
function makePause() {
  const p = blank();
  fill(p, 9,  8, 13, 24);
  fill(p, 18, 8, 22, 24);
  return p;
}

// ── PREV ⏮ ──────────────────────────────────────────────────────
function makePrev() {
  const p = blank();
  fill(p, 8, 8, 11, 24);          // left bar
  leftTri(p, 13, 16, 23, 10);     // left-pointing triangle
  return p;
}

// ── NEXT ⏭ ──────────────────────────────────────────────────────
function makeNext() {
  const p = blank();
  rightTri(p, 9, 16, 20, 10);     // right-pointing triangle
  fill(p, 20, 8, 23, 24);         // right bar
  return p;
}

const outDir = path.join(__dirname, '..', 'src', 'assets', 'thumbar');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'prev.png'),  toPNG(W, H, makePrev()));
fs.writeFileSync(path.join(outDir, 'play.png'),  toPNG(W, H, makePlay()));
fs.writeFileSync(path.join(outDir, 'pause.png'), toPNG(W, H, makePause()));
fs.writeFileSync(path.join(outDir, 'next.png'),  toPNG(W, H, makeNext()));
console.log('OK thumbar icons regenerated at 32x32 with anti-aliasing');
