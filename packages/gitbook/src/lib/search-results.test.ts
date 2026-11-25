import { describe, expect, it } from 'bun:test';

import type {
    SearchPageResult,
    SearchRecordResult,
    SearchSpaceResult,
    SiteSpace,
    SiteStructure,
} from '@gitbook/api';

import { getBaseContext } from './context';
import { getEmbeddableLinker } from './embeddable-linker';
import { createSiteLinker } from './links';
import { getSearchSpaceLookup, transformSitePageResult } from './search';
import { computePublishedSearchResults, computeSearchResults } from './search-results';
import { findSiteSpaceBy } from './sites';

function siteSpace(id: string, title: string, published: string, extra: Partial<SiteSpace> = {}) {
    return {
        object: 'site-space',
        id: `ss_${id}`,
        title,
        path: '',
        default: false,
        draft: false,
        space: { id: `space_${id}`, title, language: 'en', permissions: { view: true } },
        urls: { published },
        ...extra,
    } as SiteSpace;
}

const structure = {
    type: 'sections',
    structure: [
        {
            object: 'site-section',
            id: 'section_guides',
            title: 'Guides',
            default: true,
            siteSpaces: [siteSpace('guides', 'Guides', 'https://docs.example.com/')],
        },
        {
            object: 'site-section-group',
            id: 'group_products',
            title: 'Products',
            icon: 'box',
            children: [
                {
                    object: 'site-section',
                    id: 'section_api',
                    title: 'API',
                    icon: 'code',
                    siteSpaces: [
                        siteSpace('v2', 'v2', 'https://docs.example.com/api/', { default: true }),
                        siteSpace('v1', 'v1', 'https://docs.example.com/api/v1/'),
                        siteSpace('v0', 'v0', 'https://docs.example.com/api/v0/', { hidden: true }),
                    ],
                },
            ],
        },
    ],
} as unknown as SiteStructure;

function space(id: string, score: number, pages: Partial<SearchPageResult>[]): SearchSpaceResult {
    return {
        type: 'space',
        id: `space_${id}`,
        title: id,
        score,
        pages: pages.map((page) => ({
            title: `Page ${page.id}`,
            description: 'Synthetic result',
            score: 10 - (page.rank ?? 0),
            ancestors: [],
            urls: { app: 'https://app.gitbook.com/o/org/s/space' },
            ...page,
        })) as SearchPageResult[],
    };
}

const items: (SearchSpaceResult | SearchRecordResult)[] = [
    space('v2', 3, [
        {
            id: 'auth',
            path: 'authentication',
            rank: 2,
            ancestors: [{ title: 'Getting started' }],
            sections: [
                {
                    id: 'tokens',
                    title: 'Tokens',
                    body: 'Create a token',
                    path: 'authentication#tokens',
                    score: 4,
                    urls: { app: 'https://app.gitbook.com/o/org/s/space' },
                },
            ],
        },
    ]),
    space('guides', 2, [
        { id: 'intro', path: '', rank: 1 },
        { id: 'status', path: 'https://status.example.com/', rank: 3 },
    ]),
    space('v1', 1, [{ id: 'legacy', path: 'legacy/authentication', rank: 4 }]),
    space('v0', 1, [{ id: 'reference', path: 'reference', rank: 5 }]),
    {
        type: 'record',
        id: 'record_1',
        title: 'Support ticket',
        description: 'Reset a token',
        url: 'https://support.example.com/1',
        score: 2,
    } as SearchRecordResult,
];

describe('computePublishedSearchResults', () => {
    it.each([
        ['url-host', false],
        ['url-host', true],
        ['url', false],
        ['url', true],
    ] as const)('gives the route results (%s, embedded: %p)', (urlMode, asEmbeddable) => {
        const context = getBaseContext({
            siteURL: 'https://docs.example.com/api/',
            siteURLData: {
                organization: 'org_1',
                site: 'site_1',
                siteSection: 'section_api',
                siteSpace: 'ss_v2',
                space: 'space_v2',
                siteBasePath: '/',
                basePath: '/api/',
                apiToken: 'page-token',
                imagesContextId: 'images',
            } as Parameters<typeof getBaseContext>[0]['siteURLData'],
            urlMode,
        });
        const directSearch = context.directSearch!;
        const embed = (linker: typeof context.linker) =>
            asEmbeddable ? getEmbeddableLinker(linker) : linker;

        const route = computeSearchResults(items, (spaceItem, pageItem) => {
            const found = findSiteSpaceBy(structure, (s) => s.space.id === spaceItem.id);
            return transformSitePageResult({
                asEmbeddable,
                linker: embed(context.linker),
                pageItem,
                spaceItem,
                siteSpace: found?.siteSpace,
                siteSection: found?.siteSection ?? undefined,
                siteSectionGroup: found?.siteSectionGroup ?? undefined,
            });
        });
        const browser = computePublishedSearchResults({
            asEmbeddable,
            linker: embed(createSiteLinker(directSearch.linker)),
            searchResults: items,
            spaces: getSearchSpaceLookup(structure),
        });

        expect(JSON.stringify(directSearch)).not.toContain('page-token');
        expect(browser).toEqual(route);
        expect(browser?.map((result) => result.id)).toEqual([
            'space_guides/intro',
            'space_v2/auth',
            'space_guides/status',
            'space_v1/legacy',
            'space_v0/reference',
            'record_1',
        ]);
    });

    it('includes readable published hidden spaces and excludes draft, denied, or unpublished placements', () => {
        const hidden = siteSpace('hidden', 'Older docs', 'https://docs.example.com/old/', {
            hidden: true,
        });
        const denied = siteSpace('denied', 'Denied', 'https://docs.example.com/denied/');
        denied.space.permissions.view = false;
        const draft = siteSpace('draft', 'Draft', 'https://docs.example.com/draft/', {
            draft: true,
        });
        const unpublished = siteSpace('unpublished', 'Unpublished', '', {
            urls: {},
        });

        const spaces = getSearchSpaceLookup({
            type: 'siteSpaces',
            structure: [hidden, denied, draft, unpublished],
        });
        expect(spaces).toEqual({
            space_hidden: {
                siteSpaceId: 'ss_hidden',
                spaceURL: 'https://docs.example.com/old/',
                breadcrumbs: [],
            },
        });
    });

    it('falls back when a result belongs to an unknown space', () => {
        const spaces = getSearchSpaceLookup(structure);
        expect(Object.keys(spaces).sort()).toEqual([
            'space_guides',
            'space_v0',
            'space_v1',
            'space_v2',
        ]);

        const linker = createSiteLinker({
            urlMode: 'url-host',
            siteHost: 'docs.example.com',
            siteBasePath: '/',
            spaceBasePath: '/api/',
            gitbookURL: undefined,
        });
        const searchResults = [space('unknown', 1, [{ id: 'page', path: 'page', rank: 1 }])];
        expect(
            computePublishedSearchResults({ asEmbeddable: false, linker, searchResults, spaces })
        ).toBeNull();
    });
});

describe('direct search URL', () => {
    it.each([
        ['url-host', '/', '/~gitbook/search-direct/orgs/org_1/sites/site_1'],
        ['url-host', '/docs/', '/docs/~gitbook/search-direct/orgs/org_1/sites/site_1'],
        [
            'url',
            '/docs/',
            '/url/docs.example.com/docs/~gitbook/search-direct/orgs/org_1/sites/site_1',
        ],
    ] as const)('uses the search endpoint for %s at %s', (urlMode, siteBasePath, searchURL) => {
        const context = getBaseContext({
            siteURL: 'https://docs.example.com',
            siteURLData: {
                organization: 'org_1',
                site: 'site_1',
                siteSpace: 'ss_v2',
                space: 'space_v2',
                siteBasePath,
                basePath: `${siteBasePath}api/`,
                apiToken: 'page-token',
                imagesContextId: 'images',
            },
            urlMode,
        });

        expect(context.directSearch?.searchURL).toBe(searchURL);
    });
});
