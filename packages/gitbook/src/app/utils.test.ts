import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import jwt from 'jsonwebtoken';
import rison from 'rison';

import * as realContext from '@/lib/context';

mock.module('server-only', () => ({}));
// Only the lookup is stubbed: mocking the whole module would leak into the other test files,
// as `mock.module` replaces it for the entire test process.
mock.module('@/lib/context', () => ({
    ...realContext,
    getBaseContext: (input: unknown) => input,
    fetchSiteContextByURLLookup: async (_baseContext: unknown, data: unknown) => data,
    fetchSiteScopeContextByURLLookup: async (_baseContext: unknown, data: unknown) => data,
}));
// Stand in for the exchange endpoint, which is the only thing that can narrow the claims. It is
// stubbed at the network boundary rather than with `mock.module`, which would replace
// `@/lib/ppr-token` for the entire test process and break its own test file.
const realFetch = globalThis.fetch;

beforeAll(() => {
    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
        const { scope } = JSON.parse(String(init?.body));
        // Deterministic per scope, so the assertions below can compare tokens across pages.
        return Response.json({
            token: jwt.sign(
                { exp: Math.floor(Date.now() / 1000) + 3600, claims: { scope } },
                'secret'
            ),
        });
    }) as typeof fetch;
});

afterAll(() => {
    globalThis.fetch = realFetch;
});

const {
    getPPRHeaderRouteParams,
    getPPRPageRouteParams,
    getPPRRouteParams,
    getPPRSiteRouteParams,
    getPPRStaticSiteContext,
    getPPRStaticSiteScopeContext,
    getPPRTableOfContentsRouteParams,
    getPPRVisitorAuthClaims,
    getSiteURLDataFromParams,
} = await import('./utils');
type PPRRouteParams = import('./utils').PPRRouteParams;

const apiToken = jwt.sign(
    {
        exp: Math.floor(Date.now() / 1000) + 3600,
        siteClaims: { audience: 'external' },
        revisionClaims: { account: { tier: 'pro' } },
        pageClaims: { unsigned: { locale: 'fr' } },
    },
    'secret'
);

const routeParams: PPRRouteParams = {
    mode: 'url',
    siteURL: 'docs.example.com',
    siteData: encodeURIComponent(
        rison.encode({
            apiToken,
            site: 'site-id',
            siteSection: 'page-site-section-id',
            siteSpace: 'page-site-space-id',
            space: 'space-id',
            revision: 'resolved-revision-id',
            siteBasePath: '/docs/',
            basePath: '/docs/v/page-variant/',
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
            apiToken,
            site: 'site-id',
            space: 'space-id',
            revision: 'ppr-revision-id',
            imagesContextId: 'images-context-id',
        });
    });
});

describe('PPR cache region params', () => {
    const changedRouteParams: PPRRouteParams = {
        ...routeParams,
        siteData: encodeURIComponent(
            rison.encode({
                apiToken: jwt.sign({ siteClaims: {} }, 'other-secret'),
                site: 'site-id',
                siteSection: 'new-page-site-section-id',
                siteSpace: 'new-page-site-space-id',
                space: 'new-space-id',
                revision: 'resolved-revision-id',
                siteBasePath: '/docs/',
                basePath: '/docs/v/other-variant/',
                imagesContextId: 'images-context-id',
            })
        ),
    };

    it('keeps header params stable, API token included', async () => {
        const headerData = getSiteURLDataFromParams(await getPPRHeaderRouteParams(routeParams));
        const changedHeaderData = getSiteURLDataFromParams(
            await getPPRHeaderRouteParams(changedRouteParams)
        );

        expect(headerData).toMatchObject({
            siteSection: 'default-site-section-id',
            siteSpace: 'default-site-space-id',
            space: 'default-space-id',
            // The default variant is served at the site root, so its links can't keep the base
            // path of the variant the visitor is on.
            basePath: '/docs/',
        });
        // The whole point of the exchange: the site-scoped token no longer varies per page, so the
        // header can be cached once for the site instead of once per page.
        expect(headerData).toEqual(changedHeaderData);
    });

    it('keeps the visited location in the site params, with the header token', async () => {
        const siteData = getSiteURLDataFromParams(await getPPRSiteRouteParams(routeParams));
        const headerData = getSiteURLDataFromParams(await getPPRHeaderRouteParams(routeParams));

        // The shell renders the variant the visitor is on, it just never reads below the site level.
        expect(siteData).toMatchObject({
            siteSection: 'page-site-section-id',
            siteSpace: 'page-site-space-id',
            space: 'space-id',
            basePath: '/docs/v/page-variant/',
            revision: 'ppr-revision-id',
        });
        // Same scope as the header, so they share their site fetch.
        expect(siteData.apiToken).toBe(headerData.apiToken);
    });

    it('narrows the header token to the site scope', async () => {
        const { apiToken: headerToken } = getSiteURLDataFromParams(
            await getPPRHeaderRouteParams(routeParams)
        );

        expect(headerToken).not.toBe(apiToken);
        expect(jwt.decode(headerToken)).toMatchObject({ claims: { scope: 'site' } });
    });

    it('keeps the visited base path when the defaults point at the visited variant', async () => {
        const headerData = getSiteURLDataFromParams(
            await getPPRHeaderRouteParams({
                ...routeParams,
                pprDefaults: encodeURIComponent(
                    rison.encode({
                        siteSection: 'page-site-section-id',
                        siteSpace: 'page-site-space-id',
                        space: 'space-id',
                    })
                ),
            })
        );

        expect(headerData).toMatchObject({
            siteSpace: 'page-site-space-id',
            basePath: '/docs/v/page-variant/',
        });
    });

    it('keeps TOC params stable apart from its current location', async () => {
        const tocData = getSiteURLDataFromParams(
            await getPPRTableOfContentsRouteParams(routeParams)
        );
        const changedTOCData = getSiteURLDataFromParams(
            await getPPRTableOfContentsRouteParams(changedRouteParams)
        );

        expect(tocData).toMatchObject({
            siteSection: 'page-site-section-id',
            siteSpace: 'page-site-space-id',
            space: 'space-id',
            basePath: '/docs/v/page-variant/',
        });
        // The revision-scoped token drops the page claims, so it is shared by every page of the
        // space; only the location data still varies.
        expect(tocData.apiToken).toBe(changedTOCData.apiToken);
        expect({
            ...tocData,
            siteSection: undefined,
            siteSpace: undefined,
            space: undefined,
            basePath: undefined,
        }).toEqual({
            ...changedTOCData,
            siteSection: undefined,
            siteSpace: undefined,
            space: undefined,
            basePath: undefined,
        });
    });

    it('narrows the TOC and page tokens to their own scopes', async () => {
        const tocData = getSiteURLDataFromParams(
            await getPPRTableOfContentsRouteParams(routeParams)
        );
        const pageData = getSiteURLDataFromParams(await getPPRPageRouteParams(routeParams));

        expect(jwt.decode(tocData.apiToken)).toMatchObject({ claims: { scope: 'revision' } });
        expect(jwt.decode(pageData.apiToken)).toMatchObject({ claims: { scope: 'page' } });
        expect(tocData.apiToken).not.toBe(pageData.apiToken);
    });
});

describe('getPPRVisitorAuthClaims', () => {
    it('resolves every scope at once through a full exchange', async () => {
        // The scoped tokens each carry one bucket, so the client claims can only come from `full`.
        expect(await getPPRVisitorAuthClaims(routeParams)).toEqual({ scope: 'full' });
    });
});

describe('getPPRStaticSiteScopeContext', () => {
    it('resolves the site scope from the supplied params', async () => {
        const { context } = await getPPRStaticSiteScopeContext(
            getPPRRouteParams(routeParams),
            'header'
        );

        expect(context).toMatchObject({
            apiToken,
            revision: 'ppr-revision-id',
        });
    });
});

describe('getPPRStaticSiteContext', () => {
    it('uses the supplied API token without resolving published content again', async () => {
        const { context } = await getPPRStaticSiteContext(getPPRRouteParams(routeParams), 'body');

        expect(context).toMatchObject({
            apiToken,
            revision: 'ppr-revision-id',
        });
    });
});
