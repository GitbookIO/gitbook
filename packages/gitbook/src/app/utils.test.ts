import { describe, expect, it, mock } from 'bun:test';

import rison from 'rison';

mock.module('server-only', () => ({}));

const { getPPRRouteParams, getSiteURLDataFromParams } = await import('./utils');
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
    revisionId: encodeURIComponent('ppr-revision-id'),
    revalidationId: encodeURIComponent('revalidation-id'),
    tocAPIToken: encodeURIComponent('toc-api-token'),
    pageAPIToken: encodeURIComponent('page-api-token'),
    pagePath: 'guide',
};

describe('getPPRRouteParams', () => {
    it.each([
        ['structure', 'structure-api-token'],
        ['toc', 'toc-api-token'],
        ['page', 'page-api-token'],
    ] as const)(
        'uses the %s API token without retaining sibling PPR tokens',
        (region, apiToken) => {
            const params = getPPRRouteParams(routeParams, region);

            expect(params).toMatchObject({
                mode: routeParams.mode,
                siteURL: routeParams.siteURL,
                pagePath: routeParams.pagePath,
            });
            expect(params).not.toHaveProperty('tocAPIToken');
            expect(params).not.toHaveProperty('pageAPIToken');
            expect(params).not.toHaveProperty('revisionId');
            expect(params).not.toHaveProperty('revalidationId');
            expect(getSiteURLDataFromParams(params).apiToken).toBe(apiToken);
            expect(getSiteURLDataFromParams(params)).toMatchObject({
                site: 'site-id',
                space: 'space-id',
                revision: 'ppr-revision-id',
                revalidationId: 'revalidation-id',
                imagesContextId: 'images-context-id',
            });
        }
    );
});
