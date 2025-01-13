import { headers } from 'next/headers';

import { SiteContentPointer, SpaceContentPointer } from './api';

/**
 * Get the current site content pointer from the headers
 */
export async function getSiteContentPointer(): Promise<SiteContentPointer> {
    const headersList = await headers();
    const spaceId = headersList.get('x-gitbook-content-space');
    const siteId = headersList.get('x-gitbook-content-site');
    const organizationId = headersList.get('x-gitbook-content-organization');
    const siteSpaceId = headersList.get('x-gitbook-content-site-space');
    const siteSectionId = headersList.get('x-gitbook-content-site-section');
    const siteShareKey = headersList.get('x-gitbook-content-site-share-key');

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
        revisionId: headersList.get('x-gitbook-content-revision') ?? undefined,
        changeRequestId: headersList.get('x-gitbook-content-changerequest') ?? undefined,
    };

    return pointer;
}

/**
 * Get the current space pointer from the headers. This should be used when rendering
 * the space in an isolated context (e.g. PDF generation).
 */
export async function getSpacePointer(): Promise<SpaceContentPointer> {
    const headersList = await headers();
    const spaceId = headersList.get('x-gitbook-content-space');
    if (!spaceId) {
        throw new Error(
            'getSpacePointer is called outside the scope of a request processed by the middleware',
        );
    }

    const pointer: SpaceContentPointer = {
        spaceId,
        revisionId: headersList.get('x-gitbook-content-revision') ?? undefined,
        changeRequestId: headersList.get('x-gitbook-content-changerequest') ?? undefined,
    };

    return pointer;
}
