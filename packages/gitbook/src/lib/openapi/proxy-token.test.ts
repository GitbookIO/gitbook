import { afterAll, describe, expect, it, mock } from 'bun:test';

afterAll(() => mock.restore());

const realGlobals = await import('@/lib/env/globals');
mock.module('@/lib/env/globals', () => ({ ...realGlobals, GITBOOK_SECRET: 'test-secret-key' }));

const { buildSignedProxyUrl, isAllowedByOrigins, verifyProxyRequest } =
    await import('./proxy-token');

describe('buildSignedProxyUrl', () => {
    it('returns null for empty hosts', () => {
        expect(buildSignedProxyUrl('http://localhost/proxy', [], 'site_1')).toBeNull();
    });

    it('returns null when no site id is provided', () => {
        expect(buildSignedProxyUrl('http://localhost/proxy', ['api.example.com'], '')).toBeNull();
    });

    it('builds a URL with allowed_origin, site_id and token params', () => {
        const result = buildSignedProxyUrl('http://localhost/proxy', ['api.example.com'], 'site_1');
        expect(result).not.toBeNull();

        // oxlint-disable-next-line typescript/no-non-null-assertion
        const url = new URL(result!);
        expect(url.searchParams.getAll('allowed_origin')).toEqual(['api.example.com']);
        expect(url.searchParams.get('site_id')).toBe('site_1');
        expect(url.searchParams.get('token')).toBeTruthy();
    });

    it('appends params with & when base URL already has query params', () => {
        const result = buildSignedProxyUrl(
            'http://localhost/proxy?existing=1',
            ['api.example.com'],
            'site_1'
        );
        expect(result).toContain('?existing=1&');
    });

    it('deduplicates and sorts hosts', () => {
        const result = buildSignedProxyUrl(
            'http://localhost/proxy',
            ['b.example.com', 'a.example.com', 'b.example.com'],
            'site_1'
        );
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const url = new URL(result!);
        expect(url.searchParams.getAll('allowed_origin')).toEqual([
            'a.example.com',
            'b.example.com',
        ]);
    });
});

describe('verifyProxyRequest', () => {
    it('rejects when no token is provided', () => {
        const params = new URLSearchParams();
        const result = verifyProxyRequest(params, 'https://api.example.com');
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.reason).toBe('Missing proxy authorization token');
        }
    });

    it('rejects when token is invalid', () => {
        const params = new URLSearchParams();
        params.set('allowed_origin', 'api.example.com');
        params.set('site_id', 'site_1');
        params.set('token', 'invalid-token');
        const result = verifyProxyRequest(params, 'https://api.example.com/v1/users');
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.reason).toBe('Invalid proxy authorization token');
        }
    });

    it('rejects when target is not in the allowed origins', () => {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const signed = buildSignedProxyUrl(
            'http://localhost/proxy',
            ['api.example.com'],
            'site_1'
        )!;
        const params = new URL(signed).searchParams;
        const result = verifyProxyRequest(params, 'https://evil.com/hack');
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.reason).toBe('Target URL is not in the allowed origins');
        }
    });

    it('allows when token is valid and host matches', () => {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const signed = buildSignedProxyUrl(
            'http://localhost/proxy',
            ['api.example.com'],
            'site_1'
        )!;
        const params = new URL(signed).searchParams;
        const result = verifyProxyRequest(params, 'https://api.example.com/v1/users');
        expect(result.allowed).toBe(true);
        if (result.allowed) {
            expect(result.allowedOrigins).toEqual(['api.example.com']);
        }
    });

    it('allows any protocol on an allowed host', () => {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const signed = buildSignedProxyUrl(
            'http://localhost/proxy',
            ['api.example.com'],
            'site_1'
        )!;
        const params = new URL(signed).searchParams;
        expect(verifyProxyRequest(params, 'https://api.example.com/path').allowed).toBe(true);
        expect(verifyProxyRequest(params, 'http://api.example.com/path').allowed).toBe(true);
    });

    it('supports multiple allowed hosts', () => {
        const hosts = ['api.example.com', 'cdn.example.com'];
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const signed = buildSignedProxyUrl('http://localhost/proxy', hosts, 'site_1')!;
        const params = new URL(signed).searchParams;

        expect(verifyProxyRequest(params, 'https://api.example.com/v1').allowed).toBe(true);
        expect(verifyProxyRequest(params, 'https://cdn.example.com/spec.json').allowed).toBe(true);
        expect(verifyProxyRequest(params, 'https://other.com').allowed).toBe(false);
    });

    it('rejects a forged token with tampered hosts', () => {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const signed = buildSignedProxyUrl(
            'http://localhost/proxy',
            ['api.example.com'],
            'site_1'
        )!;
        const url = new URL(signed);

        // Tamper with the allowed origins but keep the original token
        url.searchParams.delete('allowed_origin');
        url.searchParams.append('allowed_origin', 'evil.com');

        const result = verifyProxyRequest(url.searchParams, 'https://evil.com/hack');
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.reason).toBe('Invalid proxy authorization token');
        }
    });

    it('checks path prefix when origin includes a path', () => {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const signed = buildSignedProxyUrl(
            'http://localhost/proxy',
            ['api.example.com/v1'],
            'site_1'
        )!;
        const params = new URL(signed).searchParams;

        expect(verifyProxyRequest(params, 'https://api.example.com/v1').allowed).toBe(true);
        expect(verifyProxyRequest(params, 'https://api.example.com/v1/users').allowed).toBe(true);
        expect(verifyProxyRequest(params, 'https://api.example.com/v2/users').allowed).toBe(false);
        // Path-prefix confusion: /v10 must not be treated as under /v1.
        expect(verifyProxyRequest(params, 'https://api.example.com/v10/users').allowed).toBe(false);
    });

    it('rejects a hostname-suffix confusion target', () => {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const signed = buildSignedProxyUrl('http://localhost/proxy', ['api.nansen.ai'], 'site_1')!;
        const params = new URL(signed).searchParams;

        expect(verifyProxyRequest(params, 'https://api.nansen.ai/v1').allowed).toBe(true);
        expect(verifyProxyRequest(params, 'https://api.nansen.ai.evil.com/xss').allowed).toBe(
            false
        );
    });

    it('binds and returns the issuing site id', () => {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const signed = buildSignedProxyUrl(
            'http://localhost/proxy',
            ['api.example.com'],
            'site_1'
        )!;
        const url = new URL(signed);
        expect(url.searchParams.get('site_id')).toBe('site_1');

        const result = verifyProxyRequest(url.searchParams, 'https://api.example.com/v1');
        expect(result.allowed).toBe(true);
        if (result.allowed) {
            expect(result.siteId).toBe('site_1');
        }
    });

    it('rejects a token whose site id was tampered with', () => {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const signed = buildSignedProxyUrl(
            'http://localhost/proxy',
            ['api.example.com'],
            'site_1'
        )!;
        const url = new URL(signed);
        url.searchParams.set('site_id', 'site_2');

        const result = verifyProxyRequest(url.searchParams, 'https://api.example.com/v1');
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.reason).toBe('Invalid proxy authorization token');
        }
    });

    it('rejects when no site id is present', () => {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const signed = buildSignedProxyUrl(
            'http://localhost/proxy',
            ['api.example.com'],
            'site_1'
        )!;
        const url = new URL(signed);
        url.searchParams.delete('site_id');

        const result = verifyProxyRequest(url.searchParams, 'https://api.example.com');
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.reason).toBe('Missing proxy authorization token');
        }
    });
});

describe('isAllowedByOrigins', () => {
    it('requires an exact hostname match', () => {
        expect(isAllowedByOrigins('https://api.example.com/v1', ['api.example.com'])).toBe(true);
        expect(isAllowedByOrigins('https://api.example.com.evil.com/v1', ['api.example.com'])).toBe(
            false
        );
        expect(isAllowedByOrigins('https://evil-api.example.com/v1', ['api.example.com'])).toBe(
            false
        );
    });

    it('allows any path for a host-only entry', () => {
        expect(isAllowedByOrigins('https://api.example.com', ['api.example.com'])).toBe(true);
        expect(isAllowedByOrigins('https://api.example.com/a/b/c', ['api.example.com'])).toBe(true);
    });

    it('enforces a path boundary for a path entry', () => {
        const allowed = ['api.example.com/v1'];
        expect(isAllowedByOrigins('https://api.example.com/v1', allowed)).toBe(true);
        expect(isAllowedByOrigins('https://api.example.com/v1/', allowed)).toBe(true);
        expect(isAllowedByOrigins('https://api.example.com/v1/users', allowed)).toBe(true);
        expect(isAllowedByOrigins('https://api.example.com/v10', allowed)).toBe(false);
        expect(isAllowedByOrigins('https://api.example.com/v1abc', allowed)).toBe(false);
        expect(isAllowedByOrigins('https://api.example.com/v2', allowed)).toBe(false);
    });

    it('rejects a port mismatch', () => {
        expect(isAllowedByOrigins('https://api.example.com:8443/v1', ['api.example.com'])).toBe(
            false
        );
        expect(isAllowedByOrigins('https://api.example.com/v1', ['api.example.com:8443'])).toBe(
            false
        );
        expect(
            isAllowedByOrigins('https://api.example.com:8443/v1', ['api.example.com:8443'])
        ).toBe(true);
    });

    it('matches IDN and punycode hosts equivalently', () => {
        expect(isAllowedByOrigins('https://münchen.example.com/v1', ['münchen.example.com'])).toBe(
            true
        );
        expect(
            isAllowedByOrigins('https://xn--mnchen-3ya.example.com/v1', ['münchen.example.com'])
        ).toBe(true);
    });

    it('returns false for an unparseable target URL', () => {
        expect(isAllowedByOrigins('not a url', ['api.example.com'])).toBe(false);
    });
});
