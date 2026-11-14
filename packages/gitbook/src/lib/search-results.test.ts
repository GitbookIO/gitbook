import { describe, expect, it } from 'bun:test';

import type {
    SearchPageResult,
    SearchRecordResult,
    SearchSpaceResult,
    SiteSection,
    SiteSectionGroup,
    SiteSpace,
    SiteStructure,
} from '@gitbook/api';

import { getBaseContext } from './context';
import { getEmbeddableLinker } from './embeddable-linker';
import { createSiteLinker } from './links';
import { getSearchSpaceLookup, transformSitePageResult } from './search';
import { computePublishedSearchResults, computeSearchResults } from './search-results';
import { findSiteSpaceBy } from './sites';

function makeSiteSpace(id: string, spaceId: string, title: string, published: string): SiteSpace {
    return {
        object: 'site-space',
        id,
        title,
        path: '',
        default: id.endsWith('default'),
        draft: false,
        space: { id: spaceId, title, language: 'en' },
        urls: { published },
    } as SiteSpace;
}

const apiV1 = makeSiteSpace('ss_api_v1', 'space_api_v1', 'v1', 'https://docs.example.com/api/v1/');
const apiV2 = makeSiteSpace(
    'ss_api_default',
    'space_api_v2',
    'v2',
    'https://docs.example.com/api/'
);
const guides = makeSiteSpace(
    'ss_guides_default',
    'space_guides',
    'Guides',
    'https://docs.example.com/'
);

const apiSection = {
    object: 'site-section',
    id: 'section_api',
    title: 'API',
    icon: 'code',
    siteSpaces: [apiV2, apiV1],
} as unknown as SiteSection;
const guidesSection = {
    object: 'site-section',
    id: 'section_guides',
    title: 'Guides',
    default: true,
    siteSpaces: [guides],
} as unknown as SiteSection;
const productsGroup = {
    object: 'site-section-group',
    id: 'group_products',
    title: 'Products',
    icon: 'box',
    children: [apiSection],
} as unknown as SiteSectionGroup;

const structure: SiteStructure = { type: 'sections', structure: [guidesSection, productsGroup] };

function page(id: string, path: string, rank: number, extra: Partial<SearchPageResult> = {}) {
    return {
        id,
        title: `Page ${id}`,
        description: 'Synthetic result',
        path,
        score: 10 - rank,
        rank,
        ancestors: [],
        urls: { app: 'https://app.gitbook.com/o/org/s/space' },
        ...extra,
    } as SearchPageResult;
}

const items: (SearchSpaceResult | SearchRecordResult)[] = [
    {
        type: 'space',
        id: 'space_api_v2',
        title: 'v2',
        score: 3,
        pages: [
            page('page_auth', 'authentication', 2, {
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
            }),
        ],
    },
    {
        type: 'space',
        id: 'space_guides',
        title: 'Guides',
        score: 2,
        pages: [page('page_intro', '', 1), page('page_status', 'https://status.example.com/', 3)],
    },
    {
        type: 'space',
        id: 'space_api_v1',
        title: 'v1',
        score: 1,
        pages: [page('page_legacy', 'legacy/authentication', 4)],
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

function routeResults(linker: ReturnType<typeof createSiteLinker>, asEmbeddable: boolean) {
    return computeSearchResults(items, (spaceItem, pageItem) => {
        const found = findSiteSpaceBy(
            structure,
            (siteSpace) => siteSpace.space.id === spaceItem.id
        );
        return transformSitePageResult({
            asEmbeddable,
            linker,
            pageItem,
            spaceItem,
            siteSpace: found?.siteSpace,
            siteSection: found?.siteSection ?? undefined,
            siteSectionGroup: found?.siteSectionGroup ?? undefined,
        });
    });
}

describe('computePublishedSearchResults', () => {
    it.each([
        ['url-host', false],
        ['url-host', true],
        ['url', false],
        ['url', true],
    ] as const)(
        'gives the search route results for the same API answer (%s, embedded: %p)',
        (urlMode, asEmbeddable) => {
            const context = getBaseContext({
                siteURL: 'https://docs.example.com/api/',
                siteURLData: {
                    organization: 'org_1',
                    site: 'site_1',
                    siteSection: 'section_api',
                    siteSpace: 'ss_api_default',
                    space: 'space_api_v2',
                    siteBasePath: '/',
                    basePath: '/api/',
                    apiToken: 'page-token',
                    imagesContextId: 'images',
                } as Parameters<typeof getBaseContext>[0]['siteURLData'],
                urlMode,
            });
            const routeLinker = asEmbeddable ? getEmbeddableLinker(context.linker) : context.linker;

            const directSearch = context.directSearch!;
            const browserLinker = createSiteLinker(directSearch.linker);
            const browser = computePublishedSearchResults({
                asEmbeddable,
                linker: asEmbeddable ? getEmbeddableLinker(browserLinker) : browserLinker,
                searchResults: items,
                spaces: getSearchSpaceLookup(structure),
            });

            expect(JSON.stringify(directSearch)).not.toContain('page-token');
            expect(browser).toEqual(routeResults(routeLinker, asEmbeddable));
            expect(browser?.map((result) => result.id)).toEqual([
                'space_guides/page_intro',
                'space_api_v2/page_auth',
                'space_guides/page_status',
                'space_api_v1/page_legacy',
                'record_1',
            ]);
        }
    );
});

describe('getSearchSpaceLookup', () => {
    it('leaves hidden variants out, so their results go to the route', () => {
        const hiddenV1 = { ...apiV1, hidden: true } as SiteSpace;
        const withHidden: SiteStructure = {
            type: 'sections',
            structure: [
                guidesSection,
                {
                    ...productsGroup,
                    children: [{ ...apiSection, siteSpaces: [apiV2, hiddenV1] }],
                } as unknown as SiteSectionGroup,
            ],
        };
        const spaces = getSearchSpaceLookup(withHidden);

        expect(Object.keys(spaces).sort()).toEqual(['space_api_v2', 'space_guides']);
        expect(JSON.stringify(spaces)).not.toContain('ss_api_v1');
        expect(JSON.stringify(spaces)).not.toContain('/api/v1/');

        const linker = createSiteLinker({
            urlMode: 'url-host',
            siteHost: 'docs.example.com',
            siteBasePath: '/',
            spaceBasePath: '/api/',
            gitbookURL: undefined,
        });
        expect(
            computePublishedSearchResults({
                asEmbeddable: false,
                linker,
                searchResults: items,
                spaces,
            })
        ).toBeNull();
    });
});
