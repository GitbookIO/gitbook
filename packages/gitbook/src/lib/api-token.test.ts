import { describe, expect, it } from 'bun:test';
import jwt from 'jsonwebtoken';

import { isAPITokenExpired } from './api-token';

function signToken(exp: number | undefined) {
    return jwt.sign(exp === undefined ? {} : { exp }, 'secret');
}

describe('isAPITokenExpired', () => {
    const now = Math.floor(Date.now() / 1000);

    it('returns false for a token valid for a while', () => {
        expect(isAPITokenExpired(signToken(now + 3600))).toBe(false);
    });

    it('returns true for an expired token', () => {
        expect(isAPITokenExpired(signToken(now - 60))).toBe(true);
    });

    it('returns true for a token expiring within the margin', () => {
        expect(isAPITokenExpired(signToken(now + 60))).toBe(true);
    });

    it('returns false for a token without an expiration', () => {
        expect(isAPITokenExpired(signToken(undefined))).toBe(false);
    });

    it('returns false for a token that cannot be decoded', () => {
        expect(isAPITokenExpired('not-a-jwt')).toBe(false);
    });
});
