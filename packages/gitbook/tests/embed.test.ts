import { describe, expect, it } from 'bun:test';
import { getContentTestURL } from './utils';

const EMBED_SCRIPT_URL = getContentTestURL(
    'https://gitbook.gitbook.io/test-gitbook-open/~gitbook/embed/script.js'
);

describe('embed script', () => {
    it('serves the embeddable script with permissive headers', async () => {
        const response = await fetch(EMBED_SCRIPT_URL, {
            headers: {
                Origin: 'https://example.com',
            },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('application/javascript');
        expect(response.headers.get('access-control-allow-origin')).toBe('*');
        expect(response.headers.get('cross-origin-resource-policy')).toBe('cross-origin');

        const body = await response.text();
        expect(body).toContain('w.GitBook');
    });

    it('responds to OPTIONS requests with CORS headers for cross-domain insertion', async () => {
        const response = await fetch(EMBED_SCRIPT_URL, {
            method: 'OPTIONS',
            headers: {
                Origin: 'https://example.com',
                'Access-Control-Request-Method': 'GET',
            },
        });

        expect(response.status).toBe(204);
        expect(response.headers.get('access-control-allow-origin')).toBe('*');
        expect(response.headers.get('access-control-allow-methods')).toContain('GET');
    });
});
