import { describe, expect, it } from 'bun:test';
import { getContentTestURL } from './utils';

describe('robots.txt', () => {
    it('declares allow content signals for public sites', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/robots.txt')
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/plain');
        const content = await response.text();
        expect(content).toContain('Allow: /\n');
        expect(content).toContain('Content-Signal: ai-train=yes, search=yes, ai-input=yes');
    });

    it('declares deny content signals for share link sites', async () => {
        const response = await fetch(
            getContentTestURL(
                `https://gitbook-open-e2e-sites.gitbook.io/api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/robots.txt`
            )
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/plain');
        const content = await response.text();
        expect(content).toContain('Disallow: /\n');
        expect(content).toContain('Content-Signal: ai-train=no, search=no, ai-input=no');
    });
});
