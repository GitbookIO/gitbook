import { headers } from 'next/headers';

import { SiteContentPointer } from './api';

/**
 * Get the current site content pointer from the params.
 */
export function getSiteContentPointer(): SiteContentPointer {
    const headerSet = headers();
    const spaceId = headerSet.get('x-gitbook-content-space');
    if (!spaceId) {
        throw new Error(
            'getSiteContentPointer is called outside the scope of a request processed by the middleware',
        );
    }

    const siteId = headerSet.get('x-gitbook-content-site');
    const organizationId = headerSet.get('x-gitbook-content-organization');
    const siteSpaceId = headerSet.get('x-gitbook-content-site-space');
    const siteShareKey = headerSet.get('x-gitbook-content-site-share-key');

    if (!siteId || !organizationId) {
        throw new Error('Missing site content headers');
    }

    const pointer: SiteContentPointer = {
        siteId,
        spaceId,
        siteSpaceId: siteSpaceId ?? undefined,
        siteShareKey: siteShareKey ?? undefined,
        organizationId,
        revisionId: headerSet.get('x-gitbook-content-revision') ?? undefined,
        changeRequestId: headerSet.get('x-gitbook-content-changerequest') ?? undefined,
    };

    return pointer;

    // else {
    //     const content: ContentPointer = {
    //         spaceId,
    //         revisionId: headerSet.get('x-gitbook-content-revision') ?? undefined,
    //         changeRequestId: headerSet.get('x-gitbook-content-changerequest') ?? undefined,
    //     };
    //     return content;
    // }
}
