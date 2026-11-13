import { describe, expect, it } from 'bun:test';
import { createHash } from 'node:crypto';

import {
    createRandomString,
    getPreviewCommentsAuthorizeURL,
    getPreviewCommentsCookieNames,
} from './auth';

describe('getPreviewCommentsAuthorizeURL', () => {
    it('should use an S256 PKCE challenge of the verifier', async () => {
        const codeVerifier = createRandomString();
        const url = new URL(
            await getPreviewCommentsAuthorizeURL({
                clientId: 'client',
                redirectUri: 'https://docs.example.com/~gitbook/comments/callback',
                state: 'state',
                codeVerifier,
            })
        );

        expect(url.pathname).toBe('/authorize');
        expect(url.searchParams.get('code_challenge_method')).toBe('S256');
        expect(url.searchParams.get('code_challenge')).toBe(
            createHash('sha256').update(codeVerifier).digest('base64url')
        );
        expect(url.searchParams.get('redirect_uri')).toBe(
            'https://docs.example.com/~gitbook/comments/callback'
        );
        expect(url.searchParams.get('scope')).toBe('space:read space:write');
    });
});

describe('createRandomString', () => {
    it('should be URL safe', () => {
        expect(createRandomString()).toMatch(/^[A-Za-z0-9_-]{43}$/);
    });
});

describe('getPreviewCommentsCookieNames', () => {
    it('should scope cookies per site', () => {
        expect(getPreviewCommentsCookieNames('site_a').session).not.toBe(
            getPreviewCommentsCookieNames('site_b').session
        );
    });
});
