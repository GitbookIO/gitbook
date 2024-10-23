'use server';

import { PageFeedbackRating } from '@gitbook/api';

import { api } from '@/lib/api';
import { getSiteContentPointer } from '@/lib/pointer';

export async function postPageFeedback(args: {
    pageId: string;
    visitorId: string;
    rating: PageFeedbackRating;
}) {
    const { organizationId, siteId, siteSpaceId } = getSiteContentPointer();
    if (siteSpaceId === undefined) {
        console.error(
            `No siteSpaceId in pointer. organizationId: ${organizationId}, siteId: ${siteId}, pageId: ${args.pageId}`,
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
