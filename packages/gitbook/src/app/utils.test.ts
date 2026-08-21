import { describe, expect, it, mock } from 'bun:test';
import rison from 'rison';

mock.module('server-only', () => ({}));
mock.module('@/lib/adaptive', () => ({
    getVisitorAuthClaims: () => ({}),
    getVisitorAuthClaimsFromToken: () => ({}),
    getPPRVisitorAuthClaimsFromToken: () => ({ scope: 'site-structure' }),
}));
mock.module('@/lib/context', () => ({
    getBaseContext: (input: unknown) => input,
    fetchSiteContextByURLLookup: async (_baseContext: unknown, data: unknown) => data,
}));
mock.module('jwt-decode', () => ({
    jwtDecode: () => ({}),
}));

const {
    getPPRHeaderRouteParams,
    getPPRRouteParams,
    getPPRStaticSiteContext,
    getPPRTableOfContentsRouteParams,
    getSiteURLDataFromParams,
} = await import('./utils');
type PPRRouteParams = import('./utils').PPRRouteParams;

const routeParams: PPRRouteParams = {
    mode: 'url',
    siteURL: 'docs.example.com',
    siteData: encodeURIComponent(
        rison.encode({
            apiToken: 'ppr-api-token',
            site: 'site-id',
            siteSection: 'page-site-section-id',
            siteSpace: 'page-site-space-id',
            space: 'space-id',
            revision: 'resolved-revision-id',
            imagesContextId: 'images-context-id',
        })
    ),
    revisionId: encodeURIComponent('ppr-revision-id'),
    revalidationId: encodeURIComponent('revalidation-id'),
    pprDefaults: encodeURIComponent(
        rison.encode({
            siteSection: 'default-site-section-id',
            siteSpace: 'default-site-space-id',
            space: 'default-space-id',
        })
    ),
    pagePath: 'guide',
};

describe('getPPRRouteParams', () => {
    it('removes the PPR cache key while preserving resolved content and API token', () => {
        const params = getPPRRouteParams(routeParams);

        expect(params).toMatchObject({
            mode: routeParams.mode,
            siteURL: routeParams.siteURL,
            pagePath: routeParams.pagePath,
        });
        expect(params).not.toHaveProperty('revisionId');
        expect(params).not.toHaveProperty('revalidationId');
        expect(params).not.toHaveProperty('pprDefaults');
        expect(getSiteURLDataFromParams(params)).toMatchObject({
            apiToken: 'ppr-api-token',
            site: 'site-id',
            space: 'space-id',
            revision: 'ppr-revision-id',
            revalidationId: 'revalidation-id',
            imagesContextId: 'images-context-id',
        });
    });
});

describe('PPR cache region params', () => {
    const changedRouteParams: PPRRouteParams = {
        ...routeParams,
        siteData: encodeURIComponent(
            rison.encode({
                apiToken: 'new-ppr-api-token',
                site: 'site-id',
                siteSection: 'new-page-site-section-id',
                siteSpace: 'new-page-site-space-id',
                space: 'new-space-id',
                revision: 'resolved-revision-id',
                imagesContextId: 'images-context-id',
            })
        ),
    };

    it('keeps header params stable apart from the API token', () => {
        const headerData = getSiteURLDataFromParams(getPPRHeaderRouteParams(routeParams));
        const changedHeaderData = getSiteURLDataFromParams(
            getPPRHeaderRouteParams(changedRouteParams)
        );

        expect(headerData).toMatchObject({
            apiToken: 'ppr-api-token',
            siteSection: 'default-site-section-id',
            siteSpace: 'default-site-space-id',
            space: 'default-space-id',
        });
        expect({ ...headerData, apiToken: undefined }).toEqual({
            ...changedHeaderData,
            apiToken: undefined,
        });
    });

    it('keeps TOC params stable apart from its current location and API token', () => {
        const tocData = getSiteURLDataFromParams(getPPRTableOfContentsRouteParams(routeParams));
        const changedTOCData = getSiteURLDataFromParams(
            getPPRTableOfContentsRouteParams(changedRouteParams)
        );

        expect(tocData).toMatchObject({
            apiToken: 'ppr-api-token',
            siteSection: 'page-site-section-id',
            siteSpace: 'page-site-space-id',
            space: 'space-id',
        });
        expect({
            ...tocData,
            apiToken: undefined,
            siteSection: undefined,
            siteSpace: undefined,
            space: undefined,
        }).toEqual({
            ...changedTOCData,
            apiToken: undefined,
            siteSection: undefined,
            siteSpace: undefined,
            space: undefined,
        });
    });
});

describe('getPPRStaticSiteContext', () => {
    it('uses the supplied API token without resolving published content again', async () => {
        const { context, visitorAuthClaims } = await getPPRStaticSiteContext(
            getPPRRouteParams(routeParams),
            'body'
        );

        expect(context).toMatchObject({
            apiToken: 'ppr-api-token',
            revision: 'ppr-revision-id',
            revalidationId: 'revalidation-id',
        });
        expect(visitorAuthClaims).toEqual({ scope: 'site-structure' });
    });
});
