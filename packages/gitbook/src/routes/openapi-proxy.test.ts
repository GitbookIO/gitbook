import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

// Mock DNS resolution before importing the proxy module
const mockDnsLookup = mock(() => Promise.resolve([{ address: '93.184.215.14', family: 4 }]));
mock.module('node:dns/promises', () => ({ lookup: mockDnsLookup }));

import { NextRequest } from 'next/server';

import {
    handleOpenAPIProxyOptions,
    handleOpenAPIProxyRequest,
    isBlockedHost,
} from './openapi-proxy';

const originalFetch = globalThis.fetch;

function createRequest(
    url: string,
    options?: { method?: string; headers?: Record<string, string>; body?: string }
) {
    return new NextRequest(new URL(url), {
        method: options?.method ?? 'GET',
        headers: options?.headers,
        body: options?.body,
    });
}

function getForwardedHeaders(): Headers {
    const calls = (globalThis.fetch as ReturnType<typeof mock>).mock.calls;
    // biome-ignore lint/style/noNonNullAssertion: test helper, call is guaranteed
    return calls[0]![1].headers as Headers;
}

describe('isBlockedHost', () => {
    it('blocks localhost IP', async () => {
        expect(await isBlockedHost('127.0.0.1')).toBe(true);
    });

    it('blocks private 10.x range', async () => {
        expect(await isBlockedHost('10.0.0.1')).toBe(true);
    });

    it('blocks private 172.16.x range', async () => {
        expect(await isBlockedHost('172.16.0.1')).toBe(true);
    });

    it('blocks private 192.168.x range', async () => {
        expect(await isBlockedHost('192.168.1.1')).toBe(true);
    });

    it('blocks link-local 169.254.x (cloud metadata)', async () => {
        expect(await isBlockedHost('169.254.169.254')).toBe(true);
    });

    it('blocks IPv6 loopback', async () => {
        expect(await isBlockedHost('::1')).toBe(true);
    });

    it('blocks multicast range (224.0.0.0/4)', async () => {
        expect(await isBlockedHost('224.0.0.1')).toBe(true);
        expect(await isBlockedHost('239.255.255.255')).toBe(true);
    });

    it('blocks reserved range (240.0.0.0/4) and broadcast', async () => {
        expect(await isBlockedHost('240.0.0.1')).toBe(true);
        expect(await isBlockedHost('255.255.255.255')).toBe(true);
    });

    it('allows public IPs', async () => {
        expect(await isBlockedHost('93.184.215.14')).toBe(false);
    });

    it('resolves hostnames via DNS and checks the result', async () => {
        mockDnsLookup.mockResolvedValueOnce([{ address: '10.0.0.1', family: 4 }]);
        expect(await isBlockedHost('evil.example.com')).toBe(true);
    });

    it('blocks when DNS resolution fails', async () => {
        mockDnsLookup.mockRejectedValueOnce(new Error('ENOTFOUND'));
        expect(await isBlockedHost('nonexistent.invalid')).toBe(true);
    });

    it('blocks IPv4-mapped IPv6 addresses with private IPv4', async () => {
        expect(await isBlockedHost('::ffff:127.0.0.1')).toBe(true);
        expect(await isBlockedHost('::ffff:10.0.0.1')).toBe(true);
        expect(await isBlockedHost('::ffff:192.168.1.1')).toBe(true);
        expect(await isBlockedHost('::ffff:169.254.169.254')).toBe(true);
    });

    it('allows IPv4-mapped IPv6 addresses with public IPv4', async () => {
        expect(await isBlockedHost('::ffff:93.184.215.14')).toBe(false);
    });
});

describe('handleOpenAPIProxyRequest', () => {
    beforeEach(() => {
        mockDnsLookup.mockReset();
        mockDnsLookup.mockResolvedValue([{ address: '93.184.215.14', family: 4 }]);

        globalThis.fetch = mock(() =>
            Promise.resolve(
                new Response('ok', {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                })
            )
        );
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    it('returns 400 when scalar_url is missing', async () => {
        const req = createRequest('http://localhost/~scalar/proxy');
        const res = await handleOpenAPIProxyRequest(req);

        expect(res.status).toBe(400);
        const body = (await res.json()) as { error: string };
        expect(body.error).toBe('Missing required query parameter: scalar_url');
    });

    it('returns 400 for an invalid URL', async () => {
        const req = createRequest('http://localhost/~scalar/proxy?scalar_url=not-a-url');
        const res = await handleOpenAPIProxyRequest(req);

        expect(res.status).toBe(400);
        const body = (await res.json()) as { error: string };
        expect(body.error).toBe('Invalid URL provided in scalar_url parameter');
    });

    it('returns 400 for non-HTTP protocols', async () => {
        const req = createRequest('http://localhost/~scalar/proxy?scalar_url=ftp://example.com');
        const res = await handleOpenAPIProxyRequest(req);

        expect(res.status).toBe(400);
        const body = (await res.json()) as { error: string };
        expect(body.error).toBe('Only HTTP and HTTPS URLs are supported');
    });

    it('returns 403 for private IPs', async () => {
        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=http://169.254.169.254/latest/meta-data'
        );
        const res = await handleOpenAPIProxyRequest(req);

        expect(res.status).toBe(403);
        const body = (await res.json()) as { error: string };
        expect(body.error).toBe('Forbidden: access to private addresses is not allowed');
    });

    it('returns 403 when hostname resolves to a private IP', async () => {
        mockDnsLookup.mockResolvedValueOnce([{ address: '10.0.0.1', family: 4 }]);

        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://internal.example.com'
        );
        const res = await handleOpenAPIProxyRequest(req);

        expect(res.status).toBe(403);
    });

    it('forwards the request to the target URL', async () => {
        const target = 'https://api.example.com/v1/users';
        const req = createRequest(`http://localhost/~scalar/proxy?scalar_url=${target}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{"name":"test"}',
        });

        await handleOpenAPIProxyRequest(req);

        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        const calls = (globalThis.fetch as ReturnType<typeof mock>).mock.calls;
        // biome-ignore lint/style/noNonNullAssertion: test assertion
        const [calledUrl, calledOptions] = calls[0]!;
        expect(calledUrl).toBe(target);
        expect(calledOptions.method).toBe('POST');
    });

    it('strips request headers that should not be forwarded', async () => {
        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://api.example.com',
            {
                headers: {
                    origin: 'http://localhost:3000',
                    referer: 'http://localhost:3000/docs',
                    'x-forwarded-for': '127.0.0.1',
                    accept: 'application/json',
                },
            }
        );

        await handleOpenAPIProxyRequest(req);

        const headers = getForwardedHeaders();
        expect(headers.get('origin')).toBeNull();
        expect(headers.get('referer')).toBeNull();
        expect(headers.get('x-forwarded-for')).toBeNull();
        expect(headers.get('accept')).toBe('application/json');
    });

    it('converts X-Scalar-Cookie to cookie header', async () => {
        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://api.example.com',
            { headers: { 'x-scalar-cookie': 'session=abc123' } }
        );

        await handleOpenAPIProxyRequest(req);
        expect(getForwardedHeaders().get('cookie')).toBe('session=abc123');
    });

    it('converts X-Scalar-User-Agent to user-agent header', async () => {
        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://api.example.com',
            { headers: { 'x-scalar-user-agent': 'ScalarClient/1.0' } }
        );

        await handleOpenAPIProxyRequest(req);
        expect(getForwardedHeaders().get('user-agent')).toBe('ScalarClient/1.0');
    });

    it('sets the host header to the target host', async () => {
        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://api.example.com/v1'
        );

        await handleOpenAPIProxyRequest(req);
        expect(getForwardedHeaders().get('host')).toBe('api.example.com');
    });

    it('adds CORS headers to the response', async () => {
        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://api.example.com'
        );
        const res = await handleOpenAPIProxyRequest(req);

        expect(res.headers.get('access-control-allow-origin')).toBe('*');
        expect(res.headers.get('access-control-allow-methods')).toBe('*');
        expect(res.headers.get('access-control-allow-headers')).toBe('*');
    });

    it('strips upstream CORS headers and replaces with our own', async () => {
        globalThis.fetch = mock(() =>
            Promise.resolve(
                new Response('ok', {
                    headers: {
                        'access-control-allow-origin': 'https://specific.example.com',
                        'access-control-allow-methods': 'GET',
                        'content-type': 'application/json',
                    },
                })
            )
        );

        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://api.example.com'
        );
        const res = await handleOpenAPIProxyRequest(req);

        // Upstream CORS headers replaced with permissive ones
        expect(res.headers.get('access-control-allow-origin')).toBe('*');
        expect(res.headers.get('access-control-allow-methods')).toBe('*');
        expect(res.headers.get('content-type')).toBe('application/json');
    });

    it('strips problematic response headers', async () => {
        globalThis.fetch = mock(() =>
            Promise.resolve(
                new Response('ok', {
                    headers: {
                        'content-encoding': 'gzip',
                        'transfer-encoding': 'chunked',
                        'content-type': 'application/json',
                    },
                })
            )
        );

        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://api.example.com'
        );
        const res = await handleOpenAPIProxyRequest(req);

        expect(res.headers.get('content-encoding')).toBeNull();
        expect(res.headers.get('transfer-encoding')).toBeNull();
        expect(res.headers.get('content-type')).toBe('application/json');
    });

    it('returns 502 when the upstream fetch fails', async () => {
        globalThis.fetch = mock(() => Promise.reject(new Error('Connection refused')));

        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://api.example.com'
        );
        const res = await handleOpenAPIProxyRequest(req);

        expect(res.status).toBe(502);
        const body = (await res.json()) as { error: string };
        expect(body.error).toBe('Failed to fetch from target URL');
    });

    it('forwards upstream error responses transparently', async () => {
        const errorBody = JSON.stringify({ message: 'Unauthorized', code: 'AUTH_REQUIRED' });
        globalThis.fetch = mock(() =>
            Promise.resolve(
                new Response(errorBody, {
                    status: 401,
                    headers: { 'content-type': 'application/json', 'x-request-id': 'abc-123' },
                })
            )
        );

        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://api.example.com'
        );
        const res = await handleOpenAPIProxyRequest(req);

        expect(res.status).toBe(401);
        expect(await res.text()).toBe(errorBody);
        expect(res.headers.get('content-type')).toBe('application/json');
        expect(res.headers.get('x-request-id')).toBe('abc-123');
    });

    it('follows redirects and validates each target', async () => {
        let callCount = 0;
        globalThis.fetch = mock(() => {
            callCount++;
            if (callCount === 1) {
                return Promise.resolve(
                    new Response(null, {
                        status: 302,
                        headers: { location: 'https://final.example.com/result' },
                    })
                );
            }
            return Promise.resolve(new Response('final', { status: 200 }));
        });

        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://api.example.com'
        );
        const res = await handleOpenAPIProxyRequest(req);

        expect(res.status).toBe(200);
        expect(await res.text()).toBe('final');
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('blocks redirects to private IPs', async () => {
        globalThis.fetch = mock(() =>
            Promise.resolve(
                new Response(null, {
                    status: 302,
                    headers: { location: 'http://169.254.169.254/latest/meta-data' },
                })
            )
        );

        const req = createRequest(
            'http://localhost/~scalar/proxy?scalar_url=https://api.example.com'
        );
        const res = await handleOpenAPIProxyRequest(req);

        expect(res.status).toBe(502);
        const body = (await res.json()) as { error: string };
        expect(body.error).toBe('Failed to fetch from target URL');
    });
});

describe('handleOpenAPIProxyOptions', () => {
    it('returns 204 with CORS preflight headers', () => {
        const res = handleOpenAPIProxyOptions();

        expect(res.status).toBe(204);
        expect(res.headers.get('access-control-allow-origin')).toBe('*');
        expect(res.headers.get('access-control-allow-methods')).toBe('*');
        expect(res.headers.get('access-control-max-age')).toBe('86400');
    });
});
