import { Buffer } from 'buffer';
import crypto from 'crypto';

/**
 * Decodes a base32 string into a Buffer.
 */
export function base32Decode(base32: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let index = 0;
    const output = Buffer.alloc(Math.ceil((base32.length * 5) / 8));

    for (let i = 0; i < base32.length; i++) {
        const char = base32[i]?.toUpperCase();
        if (char === undefined) continue;
        const val = alphabet.indexOf(char);
        if (val === -1) continue;
        value = (value << 5) | val;
        bits += 5;
        if (bits >= 8) {
            output[index++] = (value >> (bits - 8)) & 255;
            bits -= 8;
        }
    }
    return output.subarray(0, index);
}

/**
 * Generates a TOTP (Time-based One-Time Password) based on RFC 6238.
 */
export function generateTOTP(
    secret: string,
    timestampMs: number,
    stepSeconds: number = 30,
    digits: number = 6
): string {
    const epoch = Math.floor(timestampMs / 1000);
    const counterValue = BigInt(Math.floor(epoch / stepSeconds));
    const counter = Buffer.alloc(8);
    counter.writeBigInt64BE(counterValue);

    const key = base32Decode(secret);
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(counter);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1]! & 0xf;
    const binary =
        ((hash[offset]! & 0x7f) << 24) |
        ((hash[offset + 1]! & 0xff) << 16) |
        ((hash[offset + 2]! & 0xff) << 8) |
        (hash[offset + 3]! & 0xff);

    return (binary % 10 ** digits).toString().padStart(digits, '0');
}

/**
 * Generates a random User-Agent-like identifier used by the Spotify token API.
 */
export function generateSpotifyUserAgent(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100) * 1000;
    const bytes = crypto.randomBytes(16).toString('hex');
    return `${timestamp}${random}${bytes}`;
}
