import { describe, expect, it } from 'bun:test';
import { getContentTestURL } from './utils';

describe('CORS', () => {
    // On the shared GitBook hosting domain `gitbook.io`, customer sites live on
    // different subdomains side-by-side, so CORS must be locked to exact-hostname
    // matches only. A sibling subdomain or the bare parent must NOT be allowed.
    describe('on a shared gitbook.io hosting domain', () => {
        const TEST_URL = getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open');

        it('should allow a request from the exact same hostname', async () => {
            const origin = 'https://gitbook.gitbook.io';
            const response = await fetch(TEST_URL, {
                headers: { Origin: origin },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBe(origin);
            expect(response.headers.get('access-control-allow-credentials')).toBe('true');
        });

        it('should NOT allow a sibling subdomain on the shared domain', async () => {
            const response = await fetch(TEST_URL, {
                headers: { Origin: 'https://docs.gitbook.io' },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBeNull();
            expect(response.headers.get('access-control-allow-credentials')).toBeNull();
        });

        it('should NOT allow the bare shared parent domain (gitbook.io)', async () => {
            const response = await fetch(TEST_URL, {
                headers: { Origin: 'https://gitbook.io' },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBeNull();
            expect(response.headers.get('access-control-allow-credentials')).toBeNull();
        });

        it('should NOT allow a deeper subdomain on the shared domain', async () => {
            const response = await fetch(TEST_URL, {
                headers: { Origin: 'https://foo.bar.gitbook.io' },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBeNull();
        });

        it('should reject an unrelated origin', async () => {
            const response = await fetch(TEST_URL, {
                headers: { Origin: 'https://evil.example.com' },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBeNull();
        });

        it('should not set CORS headers when no Origin is provided', async () => {
            const response = await fetch(TEST_URL);

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBeNull();
            expect(response.headers.get('access-control-allow-credentials')).toBeNull();
        });
    });

    // On a customer custom domain with 3+ labels, requests from the parent
    // domain, sibling subdomains and deeper subdomains are all allowed.
    describe('on a customer custom domain (docs.snyk.io)', () => {
        const TEST_URL = getContentTestURL('https://docs.snyk.io');

        it('should allow a request from the exact same hostname', async () => {
            const origin = 'https://docs.snyk.io';
            const response = await fetch(TEST_URL, {
                headers: { Origin: origin },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBe(origin);
            expect(response.headers.get('access-control-allow-credentials')).toBe('true');
        });

        it('should allow a request from a sibling subdomain', async () => {
            const origin = 'https://learn.snyk.io';
            const response = await fetch(TEST_URL, {
                headers: { Origin: origin },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBe(origin);
        });

        it('should allow a request from the bare parent domain', async () => {
            const origin = 'https://snyk.io';
            const response = await fetch(TEST_URL, {
                headers: { Origin: origin },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBe(origin);
        });

        it('should reject an unrelated origin', async () => {
            const response = await fetch(TEST_URL, {
                headers: { Origin: 'https://evil.example.com' },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBeNull();
        });

        it('should reject a hostname that only suffix-matches the parent', async () => {
            // `notsnyk.io` ends with `snyk.io` as a string but is not a subdomain of `snyk.io`.
            const response = await fetch(TEST_URL, {
                headers: { Origin: 'https://notsnyk.io' },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBeNull();
        });
    });

    // On a 2-label hostname like `gitbook.com`, the registrable domain is the
    // hostname itself, so subdomains under it share the same registrable domain
    // and are allowed.
    describe('on a 2-label hostname (gitbook.com)', () => {
        const TEST_URL = getContentTestURL('https://gitbook.com/docs');

        it('should allow a request from the exact same hostname', async () => {
            const origin = 'https://gitbook.com';
            const response = await fetch(TEST_URL, {
                headers: { Origin: origin },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBe(origin);
            expect(response.headers.get('access-control-allow-credentials')).toBe('true');
        }, 10_000);

        it('should allow a subdomain (same registrable domain)', async () => {
            const origin = 'https://docs.gitbook.com';
            const response = await fetch(TEST_URL, {
                headers: { Origin: origin },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBe(origin);
        }, 10_000);

        it('should reject a different registrable domain', async () => {
            const response = await fetch(TEST_URL, {
                headers: { Origin: 'https://evil.example.com' },
            });

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-origin')).toBeNull();
        }, 10_000);
    });
});
