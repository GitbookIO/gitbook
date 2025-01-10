'use server';

import { PageFeedbackRating } from '@gitbook/api';
import { assert } from 'ts-essentials';

import { api } from '@/lib/api';
import { GitBookContext } from '@/lib/gitbook-context';
import { getSiteContentPointer } from '@/lib/pointer';

export async function postPageFeedback(
    ctx: GitBookContext,
    args: {
        pageId: string;
        visitorId: string;
        rating: PageFeedbackRating;
    },
) {
    const { organizationId, siteId, siteSpaceId } = getSiteContentPointer(ctx);

    assert(
        siteSpaceId,
        `No siteSpaceId in pointer. organizationId: ${organizationId}, siteId: ${siteId}, pageId: ${args.pageId}`,
    );

    await api(ctx).client.orgs.createSitesPageFeedback(
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
