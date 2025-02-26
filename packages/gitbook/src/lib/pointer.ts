import type { SiteStructure } from '@gitbook/api';
import { headers } from 'next/headers';
import { assert } from 'ts-essentials';

import type { SiteContentPointer, SpaceContentPointer } from './api';
import { getSiteStructureSections } from './sites';

/**
 * Get the current site content pointer from the headers
 */
export async function getSiteContentPointer(): Promise<SiteContentPointer> {
    const headersList = await headers();

    const spaceId = headersList.get('x-gitbook-content-space');
    assert(spaceId, 'x-gitbook-content-space should be set in the headers by the middleware');

    const siteId = headersList.get('x-gitbook-content-site');
    assert(siteId, 'x-gitbook-content-site should be set in the headers by the middleware');

    const organizationId = headersList.get('x-gitbook-content-organization');
    assert(
        organizationId,
        'x-gitbook-content-organization should be set in the headers by the middleware'
    );

    const siteSectionId = headersList.get('x-gitbook-content-site-section') ?? undefined;
    const siteSpaceId = headersList.get('x-gitbook-content-site-space') ?? undefined;
    const siteShareKey = headersList.get('x-gitbook-content-site-share-key') ?? undefined;
    const revisionId = headersList.get('x-gitbook-content-revision') ?? undefined;
    const changeRequestId = headersList.get('x-gitbook-content-changerequest') ?? undefined;

    const pointer: SiteContentPointer = {
        siteId,
        spaceId,
        organizationId,
        siteSectionId,
        siteSpaceId,
        siteShareKey,
        revisionId,
        changeRequestId,
    };

    return pointer;
}

/**
 * Check if the pointer is the root one.
 * Meaning we are on the default section / space.
 */
export function checkIsRootPointer(
    pointer: SiteContentPointer,
    siteStructure: SiteStructure
): boolean {
    switch (siteStructure.type) {
        case 'sections': {
            return getSiteStructureSections(siteStructure).some(
                (structure) =>
                    structure.default &&
                    structure.id === pointer.siteSectionId &&
                    structure.siteSpaces.some(
                        (siteSpace) => siteSpace.default && siteSpace.id === pointer.siteSpaceId
                    )
            );
        }
        case 'siteSpaces': {
            return siteStructure.structure.some(
                (siteSpace) => siteSpace.default && siteSpace.id === pointer.siteSpaceId
            );
        }
    }
}

/**
 * Get the current space pointer from the headers. This should be used when rendering
 * the space in an isolated context (e.g. PDF generation).
 */
export async function getSpacePointer(): Promise<SpaceContentPointer> {
    const headersList = await headers();

    const spaceId = headersList.get('x-gitbook-content-space');
    assert(spaceId, 'x-gitbook-content-space should be set in the headers by the middleware');

    const revisionId = headersList.get('x-gitbook-content-revision') ?? undefined;
    const changeRequestId = headersList.get('x-gitbook-content-changerequest') ?? undefined;

    const pointer: SpaceContentPointer = {
        spaceId,
        revisionId,
        changeRequestId,
    };

    return pointer;
}
