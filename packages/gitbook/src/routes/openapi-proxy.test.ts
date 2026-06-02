import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

afterAll(() => mock.restore());

const mockDnsLookup = mock(() => Promise.resolve([{ address: '93.184.215.14', family: 4 }]));
mock.module('node:dns/promises', () => ({ lookup: mockDnsLookup }));
const realGlobals = await import('@/lib/env/globals');
mock.module('@/lib/env/globals', () => ({ ...realGlobals, GITBOOK_SECRET: 'test-secret-key' }));

import { NextRequest } from 'next/server';

const { buildSignedProxyUrl } = await import('@/lib/openapi/proxy-token');
const { handleOpenAPIProxyOptions, handleOpenAPIProxyRequest, isBlockedHost } = await import(
    './openapi-proxy'
);

const originalFetch = globalThis.fetch;

function signedProxyUrl(targetUrl: string, extraHosts?: string[]): string {
    const hostname = new URL(targetUrl).hostname;
    const hosts = [hostname, ...(extraHosts ?? [])];
    const signed = buildSignedProxyUrl('http://localhost/~scalar/proxy', hosts);
    return `${signed}&scalar_url=${encodeURIComponent(targetUrl)}`;
}

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
    // biome-ignore lint/style/noNonNullAssertion: test helper
    return calls[0]![1].headers as Headers;
}

async function expectJsonError(res: Response, status: number, error: string) {
    expect(res.status).toBe(status);
    expect(((await res.json()) as { error: string }).error).toBe(error);
}

describe('isBlockedHost', () => {
    it('blocks private and reserved IPs', async () => {
        for (const ip of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1', '::1']) {
            expect(await isBlockedHost(ip)).toBe(true);
        }
    });

    it('blocks cloud metadata and multicast/reserved ranges', async () => {
        for (const ip of ['169.254.169.254', '224.0.0.1', '240.0.0.1', '255.255.255.255']) {
            expect(await isBlockedHost(ip)).toBe(true);
        }
    });

    it('blocks IPv4-mapped IPv6 with private IPs', async () => {
        for (const ip of ['::ffff:127.0.0.1', '::ffff:10.0.0.1', '::ffff:169.254.169.254']) {
            expect(await isBlockedHost(ip)).toBe(true);
        }
    });

    it('allows public IPs', async () => {
        expect(await isBlockedHost('93.184.215.14')).toBe(false);
        expect(await isBlockedHost('::ffff:93.184.215.14')).toBe(false);
    });

    it('blocks when DNS resolves to a private IP', async () => {
        mockDnsLookup.mockResolvedValueOnce([{ address: '10.0.0.1', family: 4 }]);
        expect(await isBlockedHost('evil.example.com')).toBe(true);
    });

    it('blocks when DNS resolution fails', async () => {
        mockDnsLookup.mockRejectedValueOnce(new Error('ENOTFOUND'));
        expect(await isBlockedHost('nonexistent.invalid')).toBe(true);
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
        const res = await handleOpenAPIProxyRequest(
            createRequest('http://localhost/~scalar/proxy')
        );
        await expectJsonError(res, 400, 'Missing required query parameter: scalar_url');
    });

    it('returns 403 when no signed token is provided', async () => {
        const res = await handleOpenAPIProxyRequest(
            createRequest('http://localhost/~scalar/proxy?scalar_url=https://api.example.com')
        );
        await expectJsonError(res, 403, 'Missing proxy authorization token');
    });

    it('returns 403 when token is invalid', async () => {
        const res = await handleOpenAPIProxyRequest(
            createRequest(
                'http://localhost/~scalar/proxy?scalar_url=https://api.example.com&allowed_origin=api.example.com&token=bad-token'
            )
        );
        await expectJsonError(res, 403, 'Invalid proxy authorization token');
    });

    it('returns 403 when target host is not in the allowed list', async () => {
        const signed = buildSignedProxyUrl('http://localhost/~scalar/proxy', ['api.example.com']);
        const res = await handleOpenAPIProxyRequest(
            createRequest(`${signed}&scalar_url=${encodeURIComponent('https://evil.com/hack')}`)
        );
        await expectJsonError(res, 403, 'Target URL is not in the allowed origins');
    });

    it('returns 403 for private IPs even with valid token', async () => {
        const res = await handleOpenAPIProxyRequest(
            createRequest(signedProxyUrl('http://169.254.169.254/latest/meta-data'))
        );
        await expectJsonError(res, 403, 'Forbidden: access to private addresses is not allowed');
    });

    it('returns 403 when hostname resolves to a private IP', async () => {
        mockDnsLookup.mockResolvedValueOnce([{ address: '10.0.0.1', family: 4 }]);
        const res = await handleOpenAPIProxyRequest(
            createRequest(signedProxyUrl('https://internal.example.com'))
        );
        expect(res.status).toBe(403);
    });

    it('forwards the request to the target URL', async () => {
        const target = 'https://api.example.com/v1/users';
        await handleOpenAPIProxyRequest(
            createRequest(signedProxyUrl(target), {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: '{"name":"test"}',
            })
        );

        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        const calls = (globalThis.fetch as ReturnType<typeof mock>).mock.calls;
        // biome-ignore lint/style/noNonNullAssertion: test assertion
        const [calledUrl, calledOptions] = calls[0]!;
        expect(calledUrl).toBe(target);
        expect(calledOptions.method).toBe('POST');
    });

    it('strips forbidden request headers and remaps scalar headers', async () => {
        await handleOpenAPIProxyRequest(
            createRequest(signedProxyUrl('https://api.example.com/v1'), {
                headers: {
                    origin: 'http://localhost:3000',
                    referer: 'http://localhost:3000/docs',
                    'x-forwarded-for': '127.0.0.1',
                    accept: 'application/json',
                    'x-scalar-cookie': 'session=abc123',
                    'x-scalar-user-agent': 'ScalarClient/1.0',
                },
            })
        );

        const headers = getForwardedHeaders();
        // Stripped
        expect(headers.get('origin')).toBeNull();
        expect(headers.get('referer')).toBeNull();
        expect(headers.get('x-forwarded-for')).toBeNull();
        // Kept
        expect(headers.get('accept')).toBe('application/json');
        // Remapped
        expect(headers.get('cookie')).toBe('session=abc123');
        expect(headers.get('user-agent')).toBe('ScalarClient/1.0');
        // Host set to target
        expect(headers.get('host')).toBe('api.example.com');
    });

    it('adds CORS headers and strips upstream CORS/transport headers', async () => {
        globalThis.fetch = mock(() =>
            Promise.resolve(
                new Response('ok', {
                    headers: {
                        'access-control-allow-origin': 'https://specific.example.com',
                        'content-encoding': 'gzip',
                        'transfer-encoding': 'chunked',
                        'content-type': 'application/json',
                    },
                })
            )
        );

        const res = await handleOpenAPIProxyRequest(
            createRequest(signedProxyUrl('https://api.example.com'))
        );

        expect(res.headers.get('access-control-allow-origin')).toBe('*');
        expect(res.headers.get('access-control-allow-methods')).toBe('*');
        expect(res.headers.get('content-type')).toBe('application/json');
        expect(res.headers.get('content-encoding')).toBeNull();
        expect(res.headers.get('transfer-encoding')).toBeNull();
    });

    it('returns 502 when upstream fetch fails', async () => {
        globalThis.fetch = mock(() => Promise.reject(new Error('Connection refused')));
        const res = await handleOpenAPIProxyRequest(
            createRequest(signedProxyUrl('https://api.example.com'))
        );
        await expectJsonError(res, 502, 'Failed to fetch from target URL');
    });

    it('forwards upstream error responses transparently', async () => {
        const errorBody = JSON.stringify({ message: 'Unauthorized' });
        globalThis.fetch = mock(() =>
            Promise.resolve(
                new Response(errorBody, {
                    status: 401,
                    headers: { 'content-type': 'application/json', 'x-request-id': 'abc-123' },
                })
            )
        );

        const res = await handleOpenAPIProxyRequest(
            createRequest(signedProxyUrl('https://api.example.com'))
        );
        expect(res.status).toBe(401);
        expect(await res.text()).toBe(errorBody);
        expect(res.headers.get('x-request-id')).toBe('abc-123');
    });

    it('follows redirects within allowed hosts', async () => {
        let callCount = 0;
        globalThis.fetch = mock(() => {
            callCount++;
            if (callCount === 1) {
                return Promise.resolve(
                    new Response(null, {
                        status: 302,
                        headers: { location: 'https://api.example.com/redirected' },
                    })
                );
            }
            return Promise.resolve(new Response('final', { status: 200 }));
        });

        const res = await handleOpenAPIProxyRequest(
            createRequest(signedProxyUrl('https://api.example.com'))
        );
        expect(res.status).toBe(200);
        expect(await res.text()).toBe('final');
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('blocks redirects to non-allowed hosts or private IPs', async () => {
        for (const location of [
            'https://evil.com/steal-data',
            'http://169.254.169.254/latest/meta-data',
        ]) {
            globalThis.fetch = mock(() =>
                Promise.resolve(new Response(null, { status: 302, headers: { location } }))
            );

            const res = await handleOpenAPIProxyRequest(
                createRequest(signedProxyUrl('https://api.example.com'))
            );
            await expectJsonError(res, 502, 'Failed to fetch from target URL');
        }
    });

    it('allows redirects to a second allowed host', async () => {
        let callCount = 0;
        globalThis.fetch = mock(() => {
            callCount++;
            if (callCount === 1) {
                return Promise.resolve(
                    new Response(null, {
                        status: 302,
                        headers: { location: 'https://cdn.example.com/spec.json' },
                    })
                );
            }
            return Promise.resolve(new Response('from cdn', { status: 200 }));
        });

        const res = await handleOpenAPIProxyRequest(
            createRequest(signedProxyUrl('https://api.example.com', ['cdn.example.com']))
        );
        expect(res.status).toBe(200);
        expect(await res.text()).toBe('from cdn');
    });
});

describe('handleOpenAPIProxyOptions', () => {
    it('returns 204 with CORS preflight headers', () => {
        const res = handleOpenAPIProxyOptions();
        expect(res.status).toBe(204);
        expect(res.headers.get('access-control-allow-origin')).toBe('*');
        expect(res.headers.get('access-control-max-age')).toBe('86400');
    });
});
