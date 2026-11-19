import { describe, expect, it, mock } from 'bun:test';

import type { RevisionPage, SiteSection, SiteSpace, SiteStructure } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';
import { createLinker } from '@/lib/links';

mock.module('server-only', () => ({}));

const { serveLLMsTxt } = await import('./llms');

function pages(prefix: string, count: number): RevisionPage[] {
    return Array.from(
        { length: count },
        (_, index) =>
            ({
                id: `${prefix}-${index}`,
                type: 'document',
                title: `${prefix} page ${index}`,
                description: 'x'.repeat(200),
                path: `${prefix}-page-${index}`,
                pages: [],
            }) as unknown as RevisionPage
    );
}

function siteSpace(
    id: string,
    options: { path: string; language?: string; default?: boolean }
): SiteSpace {
    return {
        object: 'site-space',
        id,
        title: id,
        path: options.path,
        default: options.default ?? false,
        draft: false,
        urls: { published: `https://docs.example.com/docs/${id}/` },
        space: { id: `space-${id}`, revision: `revision-${id}`, language: options.language },
    } as unknown as SiteSpace;
}

function section(
    id: string,
    options: { path: string; default?: boolean; siteSpaces: SiteSpace[] }
): SiteSection {
    return {
        object: 'site-section',
        id,
        title: id,
        path: options.path,
        default: options.default ?? false,
        draft: false,
        siteSpaces: options.siteSpaces,
        urls: {},
    } as unknown as SiteSection;
}

function createRootContext(sections: SiteSection[], revisions: Record<string, RevisionPage[]>) {
    const rootSection = sections[0]!;
    const rootSiteSpace = rootSection.siteSpaces[0]!;
    const structure = { type: 'sections', structure: sections } as SiteStructure;

    return {
        site: { id: 'site-1', title: 'Docs' },
        locale: 'en',
        structure,
        sections: { list: sections, current: rootSection },
        siteSpace: rootSiteSpace,
        siteSpaces: rootSection.siteSpaces,
        revision: { pages: revisions[rootSiteSpace.id] },
        customization: { ai: { mode: undefined } },
        linker: createLinker({
            host: 'docs.example.com',
            siteBasePath: '/docs/',
            spaceBasePath: '/docs/',
        }),
        dataFetcher: {
            getRevision: async ({ spaceId }: { spaceId: string }) => ({
                data: { pages: revisions[spaceId.replace('space-', '')] },
            }),
        },
    } as unknown as GitBookSiteContext;
}

describe('serveLLMsTxt', () => {
    it('links a split-out section to the variant in the listed language', async () => {
        const context = createRootContext(
            [
                section('guides', {
                    path: 'guides',
                    default: true,
                    siteSpaces: [siteSpace('guides-en', { path: 'en', default: true })],
                }),
                section('reference', {
                    path: 'reference',
                    siteSpaces: [
                        siteSpace('reference-fr', { path: 'fr', language: 'fr', default: true }),
                        siteSpace('reference-en', { path: 'en' }),
                    ],
                }),
            ],
            {
                'guides-en': pages('guides', 5),
                'reference-fr': pages('reference-fr', 5),
                'reference-en': pages('reference-en', 600),
            }
        );

        const output = await (await serveLLMsTxt(context)).text();

        expect(output.length).toBeLessThanOrEqual(100_000);
        expect(output).toContain('(https://docs.example.com/docs/reference/en/llms.txt)');
        expect(output).not.toContain('(https://docs.example.com/docs/reference/llms.txt)');
    });

    it('keeps a section inline when several variants are listed without its default', async () => {
        const context = createRootContext(
            [
                section('guides', {
                    path: 'guides',
                    default: true,
                    siteSpaces: [siteSpace('guides-en', { path: 'en', default: true })],
                }),
                section('reference', {
                    path: 'reference',
                    siteSpaces: [
                        siteSpace('reference-fr', { path: 'fr', language: 'fr', default: true }),
                        siteSpace('reference-v1', { path: 'v1' }),
                        siteSpace('reference-v2', { path: 'v2' }),
                    ],
                }),
            ],
            {
                'guides-en': pages('guides', 5),
                'reference-fr': pages('reference-fr', 5),
                'reference-v1': pages('reference-v1', 300),
                'reference-v2': pages('reference-v2', 300),
            }
        );

        const output = await (await serveLLMsTxt(context)).text();

        expect(output.length).toBeLessThanOrEqual(100_000);
        expect(output).toContain('## reference');
        expect(output).toContain('/docs/reference/v1/llms.txt)');
        expect(output).not.toContain('(https://docs.example.com/docs/reference/llms.txt)');
    });
});
