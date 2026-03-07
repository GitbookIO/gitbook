import { describe, expect, it, mock } from 'bun:test';

mock.module('@/lib/env/globals', () => ({ GITBOOK_SECRET: 'test-secret-key' }));

const { buildSignedProxyUrl, verifyProxyRequest } = await import('./proxy-token');

describe('buildSignedProxyUrl', () => {
    it('returns null for empty hosts', () => {
        expect(buildSignedProxyUrl('http://localhost/proxy', [])).toBeNull();
    });

    it('builds a URL with allowed_host and token params', () => {
        const result = buildSignedProxyUrl('http://localhost/proxy', ['api.example.com']);
        expect(result).not.toBeNull();

        // biome-ignore lint/style/noNonNullAssertion: test assertion
        const url = new URL(result!);
        expect(url.searchParams.getAll('allowed_host')).toEqual(['api.example.com']);
        expect(url.searchParams.get('token')).toBeTruthy();
    });

    it('appends params with & when base URL already has query params', () => {
        const result = buildSignedProxyUrl('http://localhost/proxy?existing=1', [
            'api.example.com',
        ]);
        expect(result).toContain('?existing=1&');
    });

    it('deduplicates and sorts hosts', () => {
        const result = buildSignedProxyUrl('http://localhost/proxy', [
            'b.example.com',
            'a.example.com',
            'b.example.com',
        ]);
        // biome-ignore lint/style/noNonNullAssertion: test assertion
        const url = new URL(result!);
        expect(url.searchParams.getAll('allowed_host')).toEqual(['a.example.com', 'b.example.com']);
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
        params.set('allowed_host', 'api.example.com');
        params.set('token', 'invalid-token');
        const result = verifyProxyRequest(params, 'https://api.example.com/v1/users');
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.reason).toBe('Invalid proxy authorization token');
        }
    });

    it('rejects when target host is not in the allowed list', () => {
        // biome-ignore lint/style/noNonNullAssertion: test assertion
        const signed = buildSignedProxyUrl('http://localhost/proxy', ['api.example.com'])!;
        const params = new URL(signed).searchParams;
        const result = verifyProxyRequest(params, 'https://evil.com/hack');
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.reason).toBe('Target URL host is not in the allowed list');
        }
    });

    it('allows when token is valid and host matches', () => {
        // biome-ignore lint/style/noNonNullAssertion: test assertion
        const signed = buildSignedProxyUrl('http://localhost/proxy', ['api.example.com'])!;
        const params = new URL(signed).searchParams;
        const result = verifyProxyRequest(params, 'https://api.example.com/v1/users');
        expect(result.allowed).toBe(true);
        if (result.allowed) {
            expect(result.allowedHosts).toEqual(['api.example.com']);
        }
    });

    it('allows any protocol on an allowed host', () => {
        // biome-ignore lint/style/noNonNullAssertion: test assertion
        const signed = buildSignedProxyUrl('http://localhost/proxy', ['api.example.com'])!;
        const params = new URL(signed).searchParams;
        expect(verifyProxyRequest(params, 'https://api.example.com/path').allowed).toBe(true);
        expect(verifyProxyRequest(params, 'http://api.example.com/path').allowed).toBe(true);
    });

    it('supports multiple allowed hosts', () => {
        const hosts = ['api.example.com', 'cdn.example.com'];
        // biome-ignore lint/style/noNonNullAssertion: test assertion
        const signed = buildSignedProxyUrl('http://localhost/proxy', hosts)!;
        const params = new URL(signed).searchParams;

        expect(verifyProxyRequest(params, 'https://api.example.com/v1').allowed).toBe(true);
        expect(verifyProxyRequest(params, 'https://cdn.example.com/spec.json').allowed).toBe(true);
        expect(verifyProxyRequest(params, 'https://other.com').allowed).toBe(false);
    });

    it('rejects a forged token with tampered hosts', () => {
        // biome-ignore lint/style/noNonNullAssertion: test assertion
        const signed = buildSignedProxyUrl('http://localhost/proxy', ['api.example.com'])!;
        const url = new URL(signed);

        // Tamper with the allowed hosts but keep the original token
        url.searchParams.delete('allowed_host');
        url.searchParams.append('allowed_host', 'evil.com');

        const result = verifyProxyRequest(url.searchParams, 'https://evil.com/hack');
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.reason).toBe('Invalid proxy authorization token');
        }
    });
});
