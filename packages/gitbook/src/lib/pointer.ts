import { headers } from 'next/headers';

import { SiteContentPointer, SpaceContentPointer } from './api';

/**
 * Get the current site content pointer from the headers
 */
export function getSiteContentPointer(): SiteContentPointer {
    const headerSet = headers();
    const spaceId = headerSet.get('x-gitbook-content-space');
    const siteId = headerSet.get('x-gitbook-content-site');
    const organizationId = headerSet.get('x-gitbook-content-organization');
    const siteSpaceId = headerSet.get('x-gitbook-content-site-space');
    const siteSectionId = headerSet.get('x-gitbook-content-site-section');
    const siteShareKey = headerSet.get('x-gitbook-content-site-share-key');

    if (!spaceId || !siteId || !organizationId) {
        throw new Error(
            'getSiteContentPointer is called outside the scope of a request processed by the middleware',
        );
    }

    const pointer: SiteContentPointer = {
        siteId,
        spaceId,
        siteSectionId: siteSectionId ?? undefined,
        siteSpaceId: siteSpaceId ?? undefined,
        siteShareKey: siteShareKey ?? undefined,
        organizationId,
        revisionId: headerSet.get('x-gitbook-content-revision') ?? undefined,
        changeRequestId: headerSet.get('x-gitbook-content-changerequest') ?? undefined,
    };

    return pointer;
}

/**
 * Get the current space pointer from the headers. This should be used when rendering
 * the space in an isolated context (e.g. PDF generation).
 */
export function getSpacePointer(): SpaceContentPointer {
    const headerSet = headers();
    const spaceId = headerSet.get('x-gitbook-content-space');
    if (!spaceId) {
        throw new Error(
            'getSpacePointer is called outside the scope of a request processed by the middleware',
        );
    }

    const pointer: SpaceContentPointer = {
        spaceId,
        revisionId: headerSet.get('x-gitbook-content-revision') ?? undefined,
        changeRequestId: headerSet.get('x-gitbook-content-changerequest') ?? undefined,
    };

    return pointer;
}
