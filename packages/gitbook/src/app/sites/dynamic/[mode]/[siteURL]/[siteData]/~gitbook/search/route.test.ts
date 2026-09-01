import { describe, expect, it } from 'bun:test';

import type { SearchPageResult, SearchSpaceResult, SiteSpace } from '@gitbook/api';

import { orderSearchResultGroups } from './orderSearchResults';
import { createLinker } from '@/lib/links';
import { transformSitePageResult } from '@/lib/search';

const runwaySiteURL = 'https://docs.runway.team/';
const runwayAPIURL = 'https://api-docs.runway.team';

const linker = createLinker({
    protocol: 'https:',
    host: 'docs.runway.team',
    siteBasePath: '/',
    spaceBasePath: '/',
});

const spaceItem: SearchSpaceResult = {
    type: 'space',
    id: 'space_runway',
    title: 'Runway',
    score: 1,
    pages: [],
};

const siteSpace = {
    object: 'site-space',
    id: 'site_space_runway',
    path: '',
    space: {
        id: spaceItem.id,
        title: spaceItem.title,
        language: 'en',
    },
    title: spaceItem.title,
    draft: false,
    urls: {
        published: runwaySiteURL,
    },
} as SiteSpace;

function createPageResult(overrides: Partial<SearchPageResult> = {}): SearchPageResult {
    return {
        id: 'page_api_reference',
        title: 'API reference documentation',
        description: 'Synthetic search result',
        path: runwayAPIURL,
        score: 12,
        rank: 2,
        ancestors: [],
        urls: {
            app: 'https://app.gitbook.com/o/example/s/example',
        },
        ...overrides,
    };
}

function transformPage(pageItem: SearchPageResult, asEmbeddable = false) {
    return transformSitePageResult({
        asEmbeddable,
        linker,
        pageItem,
        spaceItem,
        siteSpace,
    });
}

describe('transformSitePageResult', () => {
    it.each([false, true])(
        'preserves the Runway external page destination when asEmbeddable is %s',
        (asEmbeddable) => {
            const result = transformPage(createPageResult(), asEmbeddable);

            expect(result.href).toBe(runwayAPIURL);
            expect(result.href.startsWith(runwaySiteURL)).toBe(false);
        }
    );

    it('preserves the complete external URL in embeddable mode', () => {
        const destination = `${runwayAPIURL}/reference?version=latest#authentication`;

        expect(transformPage(createPageResult({ path: destination }), true).href).toBe(destination);
    });

    it('resolves a relative page path through the published site URL', () => {
        const result = transformPage(createPageResult({ path: 'guides/getting-started' }));

        expect(result.href).toBe('/guides/getting-started');
    });

    it('keeps embeddable GitBook page links in the embeddable route', () => {
        const result = transformPage(createPageResult({ path: 'guides/getting-started' }), true);

        expect(result.href).toBe('/~gitbook/embed/page/guides/getting-started');
    });

    it('resolves a section result to its existing page anchor', () => {
        const result = transformPage(
            createPageResult({
                path: 'guides/getting-started',
                sections: [
                    {
                        id: 'section_authentication',
                        title: 'Authentication',
                        body: 'Synthetic section excerpt',
                        path: 'guides/getting-started#authentication',
                        score: 10,
                        resultType: 'section',
                        urls: {
                            app: 'https://app.gitbook.com/o/example/s/example',
                        },
                    },
                ],
            })
        );

        expect(result.bestSection?.href).toBe('/guides/getting-started#authentication');
    });

    it('keeps relative page behavior when the published space URL is unresolved', () => {
        const result = transformSitePageResult({
            asEmbeddable: false,
            linker,
            pageItem: createPageResult({ path: 'guides/getting-started' }),
            spaceItem,
        });

        expect(result.href).toBe('/guides/getting-started');
    });

    it('preserves ranks, scores, and result ordering', () => {
        const external = transformPage(createPageResult());
        const relative = transformPage(
            createPageResult({
                id: 'page_getting_started',
                title: 'Getting started',
                path: 'guides/getting-started',
                score: 20,
                rank: 1,
            })
        );

        const results = orderSearchResultGroups([
            { type: 'pages', results: [{ rank: external.rank, result: external }] },
            { type: 'pages', results: [{ rank: relative.rank, result: relative }] },
        ]);

        expect(results.map(({ id }) => id)).toEqual([relative.id, external.id]);
        expect(results.map(({ rank }) => rank)).toEqual([1, 2]);
        expect(results.map(({ score }) => score)).toEqual([20, 12]);
    });
});
