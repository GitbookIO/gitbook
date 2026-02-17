import { describe, expect, it } from 'bun:test';

import {
    createOAuthProtectedResourceUnauthResponse,
    handleUnauthedOAuthProtectedResourceRequest,
    isOAuthProtectedResourceMetadataRequest,
    isOAuthProtectedResourceRequest,
} from './oauth-protected';

describe('OAuth protected resources flow', () => {
    describe('handleUnauthedOAuthProtectedResourceRequest', () => {
        it('returns PRM JSON for a protected resource metadata request', async () => {
            const url = new URL(
                'https://docs.acme.org/.well-known/oauth-protected-resource/~gitbook/mcp'
            );

            const res = handleUnauthedOAuthProtectedResourceRequest({
                siteRequestURL: url,
                siteURLData: {
                    target: 'external',
                    redirect: 'https://login.acme.org/oauth2',
                    site: 'site_123',
                },
                urlMode: 'url-host',
            });

            expect(res.status).toBe(200);
            expect(res.headers.get('Content-Type')).toContain('application/json');

            const json = await res.json();
            expect(json).toEqual({
                resource: 'https://docs.acme.org/~gitbook/mcp',
                authorization_servers: ['https://sites.gitbook.com/oauth2/v1/site_123'],
            });
        });

        it('returns the 401 unauth response for the protected resource itself', () => {
            const url = new URL('https://docs.acme.org/~gitbook/mcp');

            const res = handleUnauthedOAuthProtectedResourceRequest({
                siteRequestURL: url,
                siteURLData: {
                    target: 'external',
                    redirect: 'https://login.acme.org/oauth2',
                    site: 'site_123',
                },
                urlMode: 'url-host',
            });

            expect(res.status).toBe(401);
            expect(res.headers.get('WWW-Authenticate')).toBe(
                'Bearer realm="mcp", resource_metadata="https://docs.acme.org/.well-known/oauth-protected-resource/~gitbook/mcp"'
            );
            expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
            expect(res.headers.get('Cache-Control')).toBe('no-store');
        });
    });

    describe('createMcpUnauthenticatedResponse', () => {
        it.each([
            {
                scenario: 'custom domain (with realm)',
                input: 'https://docs.acme.org/~gitbook/mcp',
                expectedResourceMetadataUrl:
                    'https://docs.acme.org/.well-known/oauth-protected-resource/~gitbook/mcp',
                expectedRealm: 'mcp',
            },
            {
                scenario: 'proxied site (with realm)',
                input: 'https://gitbook.com/docs/~gitbook/mcp',
                expectedResourceMetadataUrl:
                    'https://gitbook.com/docs/.well-known/oauth-protected-resource/~gitbook/mcp',
                expectedRealm: 'mcp',
            },
            {
                scenario: 'gitbook.io domain (with realm)',
                input: 'https://acme.gitbook.io/~gitbook/mcp',
                expectedResourceMetadataUrl:
                    'https://acme.gitbook.io/.well-known/oauth-protected-resource/~gitbook/mcp',
                expectedRealm: 'mcp',
            },
        ])(
            'should create response for $scenario',
            ({ input, expectedResourceMetadataUrl, expectedRealm }) => {
                const url = new URL(input);
                const res = createOAuthProtectedResourceUnauthResponse({
                    siteRequestURL: url,
                    urlMode: 'url-host',
                });

                expect(res.status).toBe(401);

                expect(res.headers.get('WWW-Authenticate')).toBe(
                    `Bearer realm="${expectedRealm}", resource_metadata="${expectedResourceMetadataUrl}"`
                );
                expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
                expect(res.headers.get('Cache-Control')).toBe('no-store');
            }
        );
    });

    describe('createOAuthProtectedResourceUnauthResponse errors', () => {
        it('throws when called for a non-protected path', () => {
            const url = new URL('https://docs.acme.org/not-protected');

            expect(() =>
                createOAuthProtectedResourceUnauthResponse({
                    siteRequestURL: url,
                    urlMode: 'url-host',
                })
            ).toThrow(
                'Attempted to create OAuth protected resource response for non-protected path: /not-protected'
            );
        });
    });

    describe('isOAuthProtectedResourceRequest', () => {
        it.each([
            {
                scenario: 'should match a protected endpoint',
                input: 'https://docs.acme.org/~gitbook/mcp',
                expected: true,
            },
            {
                scenario: 'should match protected endpoint at a page path',
                input: 'https://docs.acme.org/path/to/path/~gitbook/mcp',
                expected: true,
            },
            {
                scenario: 'should not match non-protected endpoint',
                input: 'https://docs.acme.org/~gitbook/other',
                expected: false,
            },
            {
                scenario: 'should not match when path does not end with endpoint',
                input: 'https://docs.acme.org/~gitbook/mcp/something',
                expected: false,
            },
            {
                scenario: 'should not match similar suffix',
                input: 'https://docs.acme.org/~gitbook/mcpx',
                expected: false,
            },
            {
                scenario: 'should also match metadata doc path (protected resource & PR metadata)',
                input: 'https://docs.acme.org/.well-known/oauth-protected-resource/~gitbook/mcp',
                expected: true,
            },
        ])('$scenario', ({ input, expected }) => {
            const url = new URL(input);
            expect(isOAuthProtectedResourceRequest(url)).toBe(expected);
        });
    });

    describe('isOAuthProtectedResourceMetadataRequest', () => {
        it.each([
            {
                scenario: 'should match metadata doc for the resource',
                input: 'https://docs.acme.org/.well-known/oauth-protected-resource/~gitbook/mcp',
                expected: true,
            },
            {
                scenario: 'should not match the resource itself',
                input: 'https://docs.acme.org/~gitbook/mcp',
                expected: false,
            },
            {
                scenario: 'should not match when resource path does not end with endpoint',
                input: 'https://docs.acme.org/.well-known/oauth-protected-resource/~gitbook/mcp/extra',
                expected: false,
            },
            {
                scenario: 'should not match similar suffix',
                input: 'https://docs.acme.org/.well-known/oauth-protected-resource/~gitbook/mcpx',
                expected: false,
            },
        ])('$scenario', ({ input, expected }) => {
            const url = new URL(input);
            expect(isOAuthProtectedResourceMetadataRequest(url)).toBe(expected);
        });
    });
});
