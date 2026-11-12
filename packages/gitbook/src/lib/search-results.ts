import type {
    GitBookAPI,
    SearchPageResult,
    SearchRecordResult,
    SearchSpaceResult,
    SiteSearchScope,
} from '@gitbook/api';

import { orderSearchResultGroups } from '@/app/sites/dynamic/[mode]/[siteURL]/[siteData]/~gitbook/search/orderSearchResults';
import type {
    ComputedPageResult,
    ComputedSectionResult,
    OrderedComputedResult,
    SearchSiteContentScope,
} from '@/components/Search/search-types';
import { toEmbeddableLinkForPublishedContent } from '@/lib/embeddable-linker';
import type { GitBookLinker, SiteLinkerInput } from '@/lib/links';
import { joinPathWithBaseURL } from '@/lib/paths';
import { checkIsHttpURL } from '@/lib/urls';

export type SearchResultBreadcrumb = NonNullable<ComputedPageResult['breadcrumbs']>[number];

/**
 * What a search result needs from the site structure for the space it belongs to.
 */
export type SearchSpaceEntry = {
    siteSpaceId?: string;
    spaceURL?: string;
    breadcrumbs: SearchResultBreadcrumb[];
};

/**
 * Search space entries keyed by space ID, for the first site space showing that space.
 */
export type SearchSpaceLookup = Record<string, SearchSpaceEntry>;

/**
 * Everything the browser needs to query the search API of a published site directly.
 */
export type DirectSearchTarget = {
    apiURL: string;
    apiToken: string;
    organizationId: string;
    siteId: string;
    linker: SiteLinkerInput;
};

export type DirectSearchProps = DirectSearchTarget & {
    spaces: SearchSpaceLookup;
};

/**
 * Body of the site search API request for a query in a scope.
 */
export function toSearchSiteContentBody(
    query: string,
    scope: SearchSiteContentScope
): Parameters<GitBookAPI['orgs']['searchSiteContent']>[2] {
    return {
        query,
        ...(scope.mode === 'current' && scope.restrictTo
            ? {
                  // `restrictTo` only exists in the newer `scope` request shape,
                  // and the published @gitbook/api types don't include it yet.
                  scope: {
                      mode: 'default',
                      currentSiteSpace: scope.siteSpaceId,
                      restrictTo: scope.restrictTo,
                  } as SiteSearchScope,
              }
            : scope),
    };
}

/**
 * Turn the search API items into ordered results, with page results computed by the caller.
 */
export function computeSearchResults(
    searchResults: (SearchSpaceResult | SearchRecordResult)[],
    getPageResult: (
        spaceItem: SearchSpaceResult,
        pageItem: SearchPageResult
    ) => ComputedPageResult | null
): OrderedComputedResult[] {
    return orderSearchResultGroups<OrderedComputedResult>(
        searchResults.map((resultItem) => {
            if (resultItem.type === 'record') {
                const result: OrderedComputedResult = {
                    type: 'record',
                    id: resultItem.id,
                    title: resultItem.title,
                    description: resultItem.description,
                    href: resultItem.url,
                    score: resultItem.score,
                };

                return { type: 'context' as const, results: [result] };
            }

            return {
                type: 'pages' as const,
                results: resultItem.pages.flatMap((pageItem) => {
                    const result = getPageResult(resultItem, pageItem);
                    return result ? [{ rank: pageItem.rank, result }] : [];
                }),
            };
        })
    );
}

/**
 * Compute the results of the published content of a site, resolving spaces from a lookup.
 */
export function computePublishedSearchResults(input: {
    asEmbeddable: boolean;
    linker: GitBookLinker;
    searchResults: (SearchSpaceResult | SearchRecordResult)[];
    spaces: SearchSpaceLookup;
}): OrderedComputedResult[] {
    const { asEmbeddable, linker, searchResults, spaces } = input;

    return computeSearchResults(searchResults, (spaceItem, pageItem) => {
        const entry: SearchSpaceEntry | undefined = spaces[spaceItem.id];
        const toHref = (pagePath: string) =>
            getPublishedPageHref({ asEmbeddable, linker, pagePath, spaceURL: entry?.spaceURL });

        return buildSearchPageResult({
            pageItem,
            spaceItem,
            entry,
            pageHref: toHref(pageItem.path),
            getSectionHref: toHref,
        });
    });
}

/**
 * Build the result for a page, with its best section.
 */
export function buildSearchPageResult(input: {
    pageItem: SearchPageResult;
    spaceItem: SearchSpaceResult;
    entry: SearchSpaceEntry | undefined;
    pageHref: string;
    getSectionHref: (sectionPath: string) => string;
}): ComputedPageResult {
    const { pageItem, spaceItem, entry, pageHref, getSectionHref } = input;

    const page: ComputedPageResult = {
        type: 'page',
        id: `${spaceItem.id}/${pageItem.id}`,
        title: pageItem.title,
        description: pageItem.description,
        href: pageHref,
        pageId: pageItem.id,
        spaceId: spaceItem.id,
        siteSpaceId: entry?.siteSpaceId,
        score: pageItem.score,
        rank: pageItem.rank,
        resultType: pageItem.resultType,
        breadcrumbs: [
            ...(entry?.breadcrumbs ?? []),
            ...pageItem.ancestors.map((ancestor) => ({
                label: ancestor.title,
            })),
        ],
    };

    const pageSections =
        pageItem.sections
            ?.filter((section) => section.title || section.body)
            .map<ComputedSectionResult>((section) => ({
                type: 'section',
                id: `${page.id}/${section.id}`,
                title: section.title,
                href: getSectionHref(section.path),
                body: section.body,
                pageId: pageItem.id,
                spaceId: spaceItem.id,
                score: section.score,
            })) ?? [];

    // The API returns at most one section per page, ordered for use as the section destination preview.
    const bestSection = pageSections[0];
    if (bestSection) {
        page.bestSection = {
            href: bestSection.href,
            title: bestSection.title,
            body: bestSection.body,
            score: bestSection.score,
        };
    }

    return page;
}

/**
 * Link to a page path of the published space at `spaceURL`.
 */
export function getPublishedPageHref(input: {
    asEmbeddable: boolean;
    linker: GitBookLinker;
    pagePath: string;
    spaceURL: string | undefined;
}) {
    const { asEmbeddable, linker, pagePath, spaceURL } = input;

    if (checkIsHttpURL(pagePath)) {
        return pagePath;
    }

    if (!spaceURL) {
        return linker.toPathInSpace(pagePath);
    }

    return asEmbeddable
        ? toEmbeddableLinkForPublishedContent(linker, spaceURL, pagePath)
        : linker.toLinkForContent(joinPathWithBaseURL(spaceURL, pagePath));
}
