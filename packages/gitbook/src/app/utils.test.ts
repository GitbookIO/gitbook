import { describe, expect, it, mock } from 'bun:test';
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
}));

const {
    getPPRHeaderRouteParams,
    getPPRRouteParams,
    getPPRStaticSiteContext,
    getPPRTableOfContentsRouteParams,
    getSiteURLDataFromParams,
} = await import('./utils');
type PPRRouteParams = import('./utils').PPRRouteParams;

const apiToken = jwt.sign(
    {
        exp: Math.floor(Date.now() / 1000) + 3600,
        siteStructureClaims: { scope: 'site-structure' },
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
                apiToken: jwt.sign({ siteStructureClaims: {} }, 'other-secret'),
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

    it('keeps header params stable apart from the API token', () => {
        const headerData = getSiteURLDataFromParams(getPPRHeaderRouteParams(routeParams));
        const changedHeaderData = getSiteURLDataFromParams(
            getPPRHeaderRouteParams(changedRouteParams)
        );

        expect(headerData).toMatchObject({
            apiToken,
            siteSection: 'default-site-section-id',
            siteSpace: 'default-site-space-id',
            space: 'default-space-id',
            // The default variant is served at the site root, so its links can't keep the base
            // path of the variant the visitor is on.
            basePath: '/docs/',
        });
        expect({ ...headerData, apiToken: undefined }).toEqual({
            ...changedHeaderData,
            apiToken: undefined,
        });
    });

    it('keeps the visited base path when the defaults point at the visited variant', () => {
        const headerData = getSiteURLDataFromParams(
            getPPRHeaderRouteParams({
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

    it('keeps TOC params stable apart from its current location and API token', () => {
        const tocData = getSiteURLDataFromParams(getPPRTableOfContentsRouteParams(routeParams));
        const changedTOCData = getSiteURLDataFromParams(
            getPPRTableOfContentsRouteParams(changedRouteParams)
        );

        expect(tocData).toMatchObject({
            apiToken,
            siteSection: 'page-site-section-id',
            siteSpace: 'page-site-space-id',
            space: 'space-id',
            basePath: '/docs/v/page-variant/',
        });
        expect({
            ...tocData,
            apiToken: undefined,
            siteSection: undefined,
            siteSpace: undefined,
            space: undefined,
            basePath: undefined,
        }).toEqual({
            ...changedTOCData,
            apiToken: undefined,
            siteSection: undefined,
            siteSpace: undefined,
            space: undefined,
            basePath: undefined,
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
            apiToken,
            revision: 'ppr-revision-id',
        });
        expect(visitorAuthClaims).toEqual({ scope: 'site-structure' });
    });
});
