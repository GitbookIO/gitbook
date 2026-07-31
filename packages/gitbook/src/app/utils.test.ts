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

const { getPPRRouteParams, getPPRStaticSiteContext, getSiteURLDataFromParams } = await import(
    './utils'
);
type PPRRouteParams = import('./utils').PPRRouteParams;

const routeParams: PPRRouteParams = {
    mode: 'url',
    siteURL: 'docs.example.com',
    siteData: encodeURIComponent(
        rison.encode({
            apiToken: 'ppr-api-token',
            site: 'site-id',
            space: 'space-id',
            revision: 'resolved-revision-id',
            imagesContextId: 'images-context-id',
        })
    ),
    revisionId: encodeURIComponent('ppr-revision-id'),
    revalidationId: encodeURIComponent('revalidation-id'),
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

describe('getPPRStaticSiteContext', () => {
    it('uses the supplied API token without resolving published content again', async () => {
        const { context, visitorAuthClaims } = await getPPRStaticSiteContext(routeParams);

        expect(context).toMatchObject({
            apiToken: 'ppr-api-token',
            revision: 'ppr-revision-id',
            revalidationId: 'revalidation-id',
        });
        expect(visitorAuthClaims).toEqual({ scope: 'site-structure' });
    });
});
