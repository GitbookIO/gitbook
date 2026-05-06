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
                'User-Agent': 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
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

describe('markdown pages', () => {
    it('should expose a markdown page with the .md extension', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/text-page.md')
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
        expect(text).toContain('# Text page');
    });

    it('should expose a markdown page with the accept header', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/text-page'),
            {
                headers: {
                    Accept: 'text/markdown',
                },
            }
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
        expect(text).toContain('# Text page');
    });

    it('should return a 200 for a page not found', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/missing-page.md')
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
        expect(text).toContain('# Page Not Found');
    });

    it('should rewrite links to markdown URLs', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/blocks/links.md')
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
        expect(text).toContain('gitbook.gitbook.io/test-gitbook-open/text-page.md');
    });
});

describe('markdown ask responses', () => {
    const ASK_QUESTION = 'What is GitBook?';
    const ASK_QUESTION_HEADING = `# ${ASK_QUESTION}`;

    it(
        'should expose ask responses for .md requests',
        async () => {
            const response = await fetch(
                getContentTestURL(
                    `https://gitbook.com/docs/getting-started/ai-documentation.md?ask=${encodeURIComponent(ASK_QUESTION)}`
                )
            );
            const text = await response.text();

            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toContain('text/markdown');
            expect(response.headers.get('x-robots-tag')).toBe('noindex');
            expect(text).toContain(ASK_QUESTION_HEADING);
        },
        { timeout: 30_000 }
    );

    it(
        'should expose ask responses for accept header markdown requests',
        async () => {
            const response = await fetch(
                getContentTestURL(
                    `https://gitbook.com/docs/getting-started/ai-documentation?ask=${encodeURIComponent(ASK_QUESTION)}`
                ),
                {
                    headers: {
                        Accept: 'text/markdown',
                    },
                }
            );
            const text = await response.text();

            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toContain('text/markdown');
            expect(response.headers.get('x-robots-tag')).toBe('noindex');
            expect(text).toContain(ASK_QUESTION_HEADING);
        },
        { timeout: 30_000 }
    );
});
