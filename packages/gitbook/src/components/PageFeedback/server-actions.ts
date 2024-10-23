'use server';

import { PageFeedbackRating } from '@gitbook/api';

import { api, SiteContentPointer } from '@/lib/api';

export async function postPageFeedback(args: {
    pointer: SiteContentPointer;
    pageId: string;
    visitorId: string;
    rating: PageFeedbackRating;
}) {
    const { organizationId, siteSpaceId, siteId } = args.pointer;
    if (siteSpaceId === undefined) {
        console.error(
            `No siteSpaceId in pointer. organizationId: ${organizationId}, siteId: ${args.pointer.siteId}, pageId: ${args.pageId}`,
        );

        return;
    }

    await api().orgs.createSitesPageFeedback(
        organizationId,
        siteId,
        siteSpaceId,
        args.pageId,
        args.visitorId,
        {
            rating: args.rating,
        },
    );
}
