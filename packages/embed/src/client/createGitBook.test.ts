import { describe, expect, it } from 'bun:test';

import { createGitBook } from './createGitBook';

describe('createGitBook.getFrameURL', () => {
    it('builds the embed URL when the site URL has no trailing slash', () => {
        const client = createGitBook({ siteURL: 'https://example.com/docs' });

        const url = new URL(client.getFrameURL({}));

        expect(url.origin).toBe('https://example.com');
        expect(url.pathname).toBe('/docs/~gitbook/embed');
        expect(url.searchParams.toString()).toBe('');
    });

    it('handles a trailing slash and adds visitor parameters', () => {
        const client = createGitBook({ siteURL: 'https://example.com/docs/' });

        const url = new URL(
            client.getFrameURL({
                visitor: {
                    token: 'signed-token',
                    unsignedClaims: {
                        role: 'editor',
                        count: 3,
                        enabled: false,
                    },
                },
            })
        );

        expect(url.pathname).toBe('/docs/~gitbook/embed');
        expect(url.searchParams.get('jwt_token')).toBe('signed-token');
        expect(url.searchParams.get('visitor.role')).toBe('editor');
        expect(url.searchParams.get('visitor.count')).toBe('3');
        expect(url.searchParams.get('visitor.enabled')).toBe('false');
    });
});
