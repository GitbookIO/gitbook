import { describe, expect, it } from 'bun:test';
import { getContentTestURL } from './utils';

const TEST_PAGE_URL = 'https://gitbook.gitbook.io/test-gitbook-open/text-page';

describe('markdown serving based on user agent', () => {
    it('should serve markdown to GPTBot (ua-match AI agent)', async () => {
        const response = await fetch(getContentTestURL(TEST_PAGE_URL), {
            headers: {
                'User-Agent': 'GPTBot/1.2',
            },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
    });

    it('should serve markdown to ClaudeBot (ua-match AI agent)', async () => {
        const response = await fetch(getContentTestURL(TEST_PAGE_URL), {
            headers: {
                'User-Agent': 'ClaudeBot/1.0',
            },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
    });

    it('should NOT serve markdown to Slackbot (heuristic detection only)', async () => {
        const response = await fetch(getContentTestURL(TEST_PAGE_URL), {
            headers: {
                'User-Agent':
                    'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
            },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');
    });

    it('should NOT serve markdown to Googlebot (traditional bot, not an AI agent)', async () => {
        const response = await fetch(getContentTestURL(TEST_PAGE_URL), {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');
    });
});

describe('robots.txt', () => {
    it('declares allow content signals for public sites', async () => {
        const response = await fetch(
            getContentTestURL(
                'https://gitbook.gitbook.io/test-gitbook-open/robots.txt?x-gitbook-search-indexation=1'
            )
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
                'https://gitbook-open-e2e-sites.gitbook.io/api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/robots.txt?x-gitbook-search-indexation=1'
            )
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/plain');
        const content = await response.text();
        expect(content).toContain('Disallow: /\n');
        expect(content).toContain('Content-Signal: ai-train=no, search=no, ai-input=no');
    });
});
