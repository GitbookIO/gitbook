import { describe, expect, it, mock } from 'bun:test';

import type { GitBookSiteContext } from '@/lib/context';
import { createLinker } from '@/lib/links';

mock.module('server-only', () => ({}));

const { serveAskMarkdown } = await import('./markdownAsk');

const context = {
    organizationId: 'org-1',
    site: { id: 'site-1' },
    siteSpace: { id: 'site-space-1' },
    customization: { ai: { mode: 'assistant' } },
    linker: createLinker({
        host: 'docs.example.com',
        siteBasePath: '/docs/',
        spaceBasePath: '/docs/',
    }),
    dataFetcher: {
        api: async () => ({
            orgs: {
                async *streamAskInSite() {
                    yield {
                        type: 'answer',
                        answer: {
                            answer: { markdown: 'Publish from the site settings.' },
                            followupQuestions: ['How do I add a custom domain?'],
                            sources: [],
                        },
                    };
                },
            },
        }),
    },
} as unknown as GitBookSiteContext;

describe('serveAskMarkdown', () => {
    it('links follow-up questions to the markdown ask route', async () => {
        const response = await serveAskMarkdown(context, 'How do I publish?', {
            goal: 'ship docs',
        });

        expect(await response.text()).toContain(
            '- [How do I add a custom domain?](https://docs.example.com/docs/index.md?ask=How%20do%20I%20add%20a%20custom%20domain%3F&goal=ship%20docs)'
        );
    });
});
