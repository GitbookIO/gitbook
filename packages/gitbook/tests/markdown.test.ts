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

describe('search parameters for indexing crawlers', () => {
    const ASK_QUESTION = 'This question must not reach Ask AI';
    const SEARCH_QUERY = 'This query must not reach search';

    it('should reject Ask AI requests from Meta external agents', async () => {
        const response = await fetch(
            getContentTestURL(
                `${TEST_PAGE_URL}?ask=${encodeURIComponent(ASK_QUESTION)}&goal=Read%20the%20docs`
            ),
            { headers: { 'User-Agent': 'meta-externalagent/1.1' } }
        );
        expect(response.status).toBe(403);
        expect(response.headers.get('content-type')).toContain('text/plain');
        expect(await response.text()).toBe(
            'This endpoint is not intended for AI training or indexing.'
        );
    });

    it('should reject search requests from Amazonbot', async () => {
        const response = await fetch(
            getContentTestURL(`${TEST_PAGE_URL}?q=${encodeURIComponent(SEARCH_QUERY)}`),
            { headers: { 'User-Agent': 'Amazonbot/0.1' } }
        );
        expect(response.status).toBe(403);
        expect(response.headers.get('content-type')).toContain('text/plain');
        expect(await response.text()).toBe(
            'This endpoint is not intended for AI training or indexing.'
        );
    });
});

describe('markdown pages', () => {
    it('should expose a markdown page with the .md extension', async () => {
        const response = await fetch(
            getContentTestURL(
                'https://gitbook.gitbook.io/test-gitbook-open/text-page.md?x-gitbook-search-indexation=1'
            )
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
        expect(text).toContain('# Text page');
    });

    it('should expose a markdown page with the accept header', async () => {
        const response = await fetch(
            getContentTestURL(
                'https://gitbook.gitbook.io/test-gitbook-open/text-page?x-gitbook-search-indexation=1'
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
        expect(text).toContain('# Text page');
    });

    it('should return a 200 for a page not found', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/missing-page.md')
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
        expect(text).toContain('# Page Not Found');
    });

    it('should rewrite links to markdown URLs', async () => {
        const response = await fetch(
            getContentTestURL(
                'https://gitbook.gitbook.io/test-gitbook-open/blocks/links.md?x-gitbook-search-indexation=1'
            )
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
        expect(text).toContain('gitbook.gitbook.io/test-gitbook-open/text-page.md');
    });
});

describe('Accept header content negotiation', () => {
    const PAGE_URL = getContentTestURL(TEST_PAGE_URL);

    it('should NOT serve markdown for Accept: text/html', async () => {
        const response = await fetch(PAGE_URL, {
            headers: { Accept: 'text/html' },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');
    });

    it('should NOT serve markdown for Accept: */*', async () => {
        const response = await fetch(PAGE_URL, {
            headers: { Accept: '*/*' },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');
    });

    it('should NOT serve markdown when text/html is preferred over text/markdown (Accept: text/html, text/markdown)', async () => {
        const response = await fetch(PAGE_URL, {
            headers: { Accept: 'text/html, text/markdown' },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');
    });

    it('should serve markdown when text/markdown is preferred over text/html (Accept: text/markdown, text/html)', async () => {
        const response = await fetch(PAGE_URL, {
            headers: { Accept: 'text/markdown, text/html' },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
    });

    it('should serve markdown when text/markdown has a higher q-value (Accept: text/html;q=0.9, text/markdown)', async () => {
        const response = await fetch(PAGE_URL, {
            headers: { Accept: 'text/html;q=0.9, text/markdown' },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
    });

    it('should NOT serve markdown when text/markdown has a lower q-value (Accept: text/html, text/markdown;q=0.9)', async () => {
        const response = await fetch(PAGE_URL, {
            headers: { Accept: 'text/html, text/markdown;q=0.9' },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');
    });

    it('should serve markdown for Accept: text/x-markdown', async () => {
        const response = await fetch(PAGE_URL, {
            headers: { Accept: 'text/x-markdown' },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
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
        { timeout: 60_000 }
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

describe('markdown robots directives', () => {
    // Preview deployments block indexation unless this param is set.
    const INDEXATION_PARAM = 'x-gitbook-search-indexation=1';
    // Share link sites are never indexable, whatever the visitor is.
    const SHARE_LINK_PAGE_URL =
        'https://gitbook-open-e2e-sites.gitbook.io/api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/3.0/other-page';

    it('should be indexable for an AI agent requesting a .md page', async () => {
        const response = await fetch(getContentTestURL(`${TEST_PAGE_URL}.md?${INDEXATION_PARAM}`), {
            headers: { 'User-Agent': 'ClaudeBot/1.0' },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('index, follow');
    });

    it('should be indexable for an AI agent served markdown on the page URL', async () => {
        const response = await fetch(getContentTestURL(`${TEST_PAGE_URL}?${INDEXATION_PARAM}`), {
            headers: { 'User-Agent': 'GPTBot/1.2' },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('index, follow');
    });

    it('should stay noindex for a non-agent requesting a .md page', async () => {
        const response = await fetch(getContentTestURL(`${TEST_PAGE_URL}.md?${INDEXATION_PARAM}`), {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
    });

    it('should be noindex, nofollow for an AI agent on a non-indexable site', async () => {
        const response = await fetch(
            getContentTestURL(`${SHARE_LINK_PAGE_URL}.md?${INDEXATION_PARAM}`),
            { headers: { 'User-Agent': 'ClaudeBot/1.0' } }
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    });

    it('should be noindex, nofollow for an AI agent on a missing page', async () => {
        const response = await fetch(
            getContentTestURL(
                `https://gitbook.gitbook.io/test-gitbook-open/missing-page.md?${INDEXATION_PARAM}`
            ),
            { headers: { 'User-Agent': 'ClaudeBot/1.0' } }
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    });
});
