import { describe, expect, it } from 'bun:test';
import jwt from 'jsonwebtoken';
import { inflateRawSync } from 'node:zlib';

import {
    API_TOKEN_COMPRESSION_THRESHOLD,
    COMPRESSED_API_TOKEN_PREFIX,
    compressAPITokenIfNeeded,
    decompressAPIToken,
} from './api-token-compression';

const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomId() {
    return Array.from({ length: 20 }, () => ALPHANUM[Math.floor(Math.random() * 62)]).join('');
}

function signToken(spaces: number, claims: Record<string, unknown> = {}) {
    return jwt.sign(
        {
            kind: 'site',
            organization: randomId(),
            site: `site_${randomId()}`,
            space: randomId(),
            spaces: Array.from({ length: spaces }, randomId),
            claims,
        },
        'secret'
    );
}

describe('compressAPITokenIfNeeded', () => {
    it('keeps tokens under the threshold unchanged', () => {
        const token = signToken(10);
        expect(token.length).toBeLessThanOrEqual(API_TOKEN_COMPRESSION_THRESHOLD);
        expect(compressAPITokenIfNeeded(token)).toBe(token);
    });

    it('compresses large tokens and restores them exactly', () => {
        const token = signToken(600, {
            groups: Array.from({ length: 100 }, (_, i) => `group-${i}`),
        });
        expect(token.length).toBeGreaterThan(API_TOKEN_COMPRESSION_THRESHOLD);

        const compressed = compressAPITokenIfNeeded(token);
        expect(compressed.startsWith(COMPRESSED_API_TOKEN_PREFIX)).toBe(true);
        expect(compressed.length).toBeLessThan(token.length * 0.85);
        expect(decompressAPIToken(compressed)).toBe(token);
    });

    it('restores tokens with non-ASCII characters and dots in the payload', () => {
        const token = signToken(600, { name: 'Zoë Ünal', 'a.b': 'é.ü.日本', email: 'z.u@ex.co' });
        expect(decompressAPIToken(compressAPITokenIfNeeded(token))).toBe(token);
    });

    it('produces a stable output for the same token', () => {
        const token = signToken(600);
        expect(compressAPITokenIfNeeded(token)).toBe(compressAPITokenIfNeeded(token));
    });

    it('produces raw deflate data', () => {
        const token = signToken(600);
        const compressed = compressAPITokenIfNeeded(token);
        const inflated = inflateRawSync(
            Buffer.from(compressed.slice(COMPRESSED_API_TOKEN_PREFIX.length), 'base64url')
        );
        const [header, payload, signature] = token.split('.');
        expect(inflated.toString()).toBe(
            `${header}.${Buffer.from(payload!, 'base64url').toString()}.${signature}`
        );
    });

    it('does not compress values that are not a JWT', () => {
        const value = 'x'.repeat(API_TOKEN_COMPRESSION_THRESHOLD + 1);
        expect(compressAPITokenIfNeeded(value)).toBe(value);
    });
});

describe('decompressAPIToken', () => {
    it('returns raw tokens unchanged', () => {
        const token = signToken(10);
        expect(decompressAPIToken(token)).toBe(token);
    });

    it('throws on corrupted compressed tokens', () => {
        expect(() => decompressAPIToken(`${COMPRESSED_API_TOKEN_PREFIX}AAAA`)).toThrow();
    });
});
