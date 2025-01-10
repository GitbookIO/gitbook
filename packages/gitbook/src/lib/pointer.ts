import { SiteContentPointer, SpaceContentPointer } from './api';
import { GitBookContext } from './gitbook-context';

/**
 * Get the current site content pointer from the headers
 */
export function getSiteContentPointer(ctx: GitBookContext): SiteContentPointer {
    const { siteId, spaceId, organizationId, siteSectionId, siteSpaceId, siteShareKey } = ctx;

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
        revisionId: ctx.contentRevisionId ?? undefined,
        changeRequestId: ctx.changeRequestId ?? undefined,
    };

    return pointer;
}

/**
 * Get the current space pointer from the headers. This should be used when rendering
 * the space in an isolated context (e.g. PDF generation).
 */
export function getSpacePointer(ctx: GitBookContext): SpaceContentPointer {
    const spaceId = ctx.spaceId;
    if (!spaceId) {
        throw new Error(
            'getSpacePointer is called outside the scope of a request processed by the middleware',
        );
    }

    const pointer: SpaceContentPointer = {
        spaceId,
        revisionId: ctx.contentRevisionId ?? undefined,
        changeRequestId: ctx.changeRequestId ?? undefined,
    };

    return pointer;
}
