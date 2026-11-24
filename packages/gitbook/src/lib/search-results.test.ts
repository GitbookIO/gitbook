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
import {
    type PublishedSearchSpaceResult,
    computePublishedSearchResults,
    computeSearchResults,
} from './search-results';
import { findSiteSpaceBy } from './sites';

function siteSpace(id: string, title: string, published: string, extra: Partial<SiteSpace> = {}) {
    return {
        object: 'site-space',
        id: `ss_${id}`,
        title,
        path: '',
        default: false,
        draft: false,
        space: { id: `space_${id}`, title, language: 'en' },
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

const items: (PublishedSearchSpaceResult | SearchRecordResult)[] = [
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
    {
        ...space('v0', 1, [{ id: 'reference', path: 'reference', rank: 5 }]),
        sitePlacement: {
            siteSpaceId: 'ss_v0',
            spaceURL: 'https://docs.example.com/api/v0/',
            breadcrumbs: [
                { icon: 'box', label: 'Products' },
                { icon: 'code', label: 'API' },
                { label: 'v0' },
            ],
        },
    },
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
        const spaces = getSearchSpaceLookup(structure);
        expect(spaces.space_v0).toBeUndefined();
        const browser = computePublishedSearchResults({
            asEmbeddable,
            linker: embed(createSiteLinker(directSearch.linker)),
            searchResults: items,
            spaces,
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

    it.each(['v0', 'unknown'])('falls back when a result has no placement (%s)', (spaceId) => {
        const spaces = getSearchSpaceLookup(structure);

        const linker = createSiteLinker({
            urlMode: 'url-host',
            siteHost: 'docs.example.com',
            siteBasePath: '/',
            spaceBasePath: '/api/',
            gitbookURL: undefined,
        });
        const searchResults = [
            ...items,
            space(spaceId, 1, [{ id: 'page', path: 'page', rank: 6 }]),
        ];
        expect(
            computePublishedSearchResults({ asEmbeddable: false, linker, searchResults, spaces })
        ).toBeNull();
    });

    it.each([
        ['url-host', false],
        ['url', true],
    ] as const)(
        'matches the route for a share-link hit (%s, embedded: %p)',
        (urlMode, asEmbeddable) => {
            const siteBasePath = '/ShareKeyPlaceholder/reader-key/';
            const baseLinker = createSiteLinker({
                urlMode,
                siteHost: 'docs.example.com',
                siteBasePath,
                spaceBasePath: siteBasePath,
                gitbookURL: undefined,
            });
            const linker = asEmbeddable ? getEmbeddableLinker(baseLinker) : baseLinker;
            const spaceItem = {
                ...space('v0', 1, [{ id: 'reference', path: 'reference', rank: 1 }]),
                sitePlacement: {
                    siteSpaceId: 'ss_v0',
                    spaceURL:
                        'https://docs.example.com/ShareKeyPlaceholder/ShareKeyPlaceholder/legacy/',
                    shareKeyPathIndex: 2,
                    breadcrumbs: [],
                },
            };
            const route = computeSearchResults([spaceItem], (item, pageItem) =>
                transformSitePageResult({
                    asEmbeddable,
                    linker,
                    spaceItem: item,
                    pageItem,
                    siteSpace: siteSpace(
                        'v0',
                        'v0',
                        'https://docs.example.com/ShareKeyPlaceholder/reader-key/legacy/'
                    ),
                })
            );
            const input = { asEmbeddable, linker, searchResults: [spaceItem], spaces: {} };
            expect(computePublishedSearchResults({ ...input, shareKey: 'reader-key' })).toEqual(
                route
            );
            expect(computePublishedSearchResults(input)).toBeNull();
        }
    );
});
