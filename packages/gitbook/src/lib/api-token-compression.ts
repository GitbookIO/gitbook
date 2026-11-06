import { deflateSync, inflateSync } from 'fflate';

/**
 * Prefix marking a compressed API token. A JWT always starts with `eyJ` and `.` is not a
 * base64url character, so it can't collide with a raw token.
 */
export const COMPRESSED_API_TOKEN_PREFIX = 'gbz1.';

/**
 * Tokens above this length are compressed before being encoded in the rewritten URL,
 * which is limited to 16KB. Smaller tokens are kept as-is so their URLs (and cache keys) don't change.
 */
export const API_TOKEN_COMPRESSION_THRESHOLD = 14 * 1024;

const DOT = 0x2e;

/**
 * Compress an API token if it is too large to safely fit in the rewritten URL.
 * The payload is decoded before compressing, as deflate does much better on JSON than on base64.
 */
export function compressAPITokenIfNeeded(token: string): string {
    if (token.length <= API_TOKEN_COMPRESSION_THRESHOLD) {
        return token;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        return token;
    }
    const [header, payload, signature] = parts as [string, string, string];

    const encoder = new TextEncoder();
    const bytes = concatBytes([
        encoder.encode(`${header}.`),
        base64UrlToBytes(payload),
        encoder.encode(`.${signature}`),
    ]);

    return `${COMPRESSED_API_TOKEN_PREFIX}${bytesToBase64Url(deflateSync(bytes, { level: 9 }))}`;
}

/**
 * Restore the original API token from a value produced by `compressAPITokenIfNeeded`.
 * Values that are not compressed are returned as-is.
 */
export function decompressAPIToken(value: string): string {
    if (!value.startsWith(COMPRESSED_API_TOKEN_PREFIX)) {
        return value;
    }

    const bytes = inflateSync(base64UrlToBytes(value.slice(COMPRESSED_API_TOKEN_PREFIX.length)));

    // Header and signature are base64url so they can't contain dots, but the payload JSON can.
    const firstDot = bytes.indexOf(DOT);
    const lastDot = bytes.lastIndexOf(DOT);
    if (firstDot === -1 || firstDot === lastDot) {
        throw new Error('Invalid compressed API token');
    }

    const decoder = new TextDecoder();
    const header = decoder.decode(bytes.subarray(0, firstDot));
    const payload = bytesToBase64Url(bytes.subarray(firstDot + 1, lastDot));
    const signature = decoder.decode(bytes.subarray(lastDot + 1));

    return `${header}.${payload}.${signature}`;
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
    const result = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
}

// Implemented with atob/btoa as Buffer is not guaranteed in the edge runtime.
function bytesToBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value: string): Uint8Array {
    const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
