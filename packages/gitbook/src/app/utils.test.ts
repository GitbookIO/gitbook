import { describe, expect, it, mock } from 'bun:test';

import rison from 'rison';

mock.module('server-only', () => ({}));
mock.module('@/lib/adaptive', () => ({
    getVisitorAuthClaims: () => ({}),
    getVisitorAuthClaimsFromToken: () => ({}),
}));
mock.module('@/lib/context', () => ({
    getBaseContext: (input: unknown) => input,
    fetchSiteContextByURLLookup: async (_baseContext: unknown, data: unknown) => data,
}));
mock.module('jwt-decode', () => ({
    jwtDecode: () => ({}),
}));

const lookupCalls: unknown[] = [];
let redirectLookup = false;
mock.module('@/lib/data', () => ({
    DataFetcherError: class DataFetcherError extends Error {},
    lookupPublishedContentByUrl: async (input: unknown) => {
        lookupCalls.push(input);
        if (redirectLookup) {
            return {
                data: {
                    redirect: 'https://docs.example.com/redirected',
                    target: 'content',
                },
            };
        }
        return {
            data: {
                apiToken: `resolved-${(input as { visitorPayload: { jwtToken: string } }).visitorPayload.jwtToken}`,
            },
        };
    },
    throwIfDataError: async <T>(response: Promise<{ data: T }>) => (await response).data,
}));

const { getPPRRouteParams, getPPRStaticSiteContext, getSiteURLDataFromParams } = await import(
    './utils'
);
type PPRRouteParams = import('./utils').PPRRouteParams;

const routeParams: PPRRouteParams = {
    mode: 'url',
    siteURL: 'docs.example.com',
    siteData: encodeURIComponent(
        rison.encode({
            apiToken: 'structure-api-token',
            site: 'site-id',
            space: 'space-id',
            revision: 'revision-id',
            imagesContextId: 'images-context-id',
        })
    ),
    lookupURL: encodeURIComponent('https://docs.example.com/guide'),
    revisionId: encodeURIComponent('ppr-revision-id'),
    revalidationId: encodeURIComponent('revalidation-id'),
    tocVisitorToken: encodeURIComponent('toc-visitor-token'),
    pageVisitorToken: encodeURIComponent('page-visitor-token'),
    pagePath: 'guide',
};

describe('getPPRRouteParams', () => {
    it('removes PPR-only parameters while preserving the structure API token and revision data', () => {
        const params = getPPRRouteParams(routeParams);

        expect(params).toMatchObject({
            mode: routeParams.mode,
            siteURL: routeParams.siteURL,
            pagePath: routeParams.pagePath,
        });
        expect(params).not.toHaveProperty('lookupURL');
        expect(params).not.toHaveProperty('tocVisitorToken');
        expect(params).not.toHaveProperty('pageVisitorToken');
        expect(params).not.toHaveProperty('revisionId');
        expect(params).not.toHaveProperty('revalidationId');
        expect(getSiteURLDataFromParams(params)).toMatchObject({
            apiToken: 'structure-api-token',
            site: 'site-id',
            space: 'space-id',
            revision: 'ppr-revision-id',
            revalidationId: 'revalidation-id',
            imagesContextId: 'images-context-id',
        });
    });
});

describe('getPPRStaticSiteContext', () => {
    it.each([
        ['toc', 'toc-visitor-token'],
        ['page', 'page-visitor-token'],
    ] as const)('resolves the %s context with its scoped visitor token', async (region, token) => {
        lookupCalls.length = 0;

        const { context } = await getPPRStaticSiteContext(routeParams, region);

        expect(lookupCalls).toEqual([
            {
                url: 'https://docs.example.com/',
                urlLookup: 'https://docs.example.com/guide',
                visitorPayload: {
                    jwtToken: token,
                    unsignedClaims: {},
                },
                redirectOnError: false,
                apiToken: 'structure-api-token',
            },
        ]);
        expect(context).toMatchObject({
            apiToken: `resolved-${token}`,
            revision: 'ppr-revision-id',
            revalidationId: 'revalidation-id',
        });
    });

    it('rejects redirects from a region lookup', async () => {
        redirectLookup = true;

        await expect(getPPRStaticSiteContext(routeParams, 'toc')).rejects.toThrow(
            'PPR content lookup resulted in a redirect'
        );

        redirectLookup = false;
    });
});
