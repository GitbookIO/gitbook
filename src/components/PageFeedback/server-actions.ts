'use server';

import { PageFeedbackRating } from '@gitbook/api';

import { api } from '@/lib/api';

export async function postPageFeedback(args: {
    spaceId: string;
    pageId: string;
    visitorId: string;
    rating: PageFeedbackRating;
}) {
    await api().spaces.createPageFeedback(args.spaceId, args.pageId, args.visitorId, {
        rating: args.rating,
    });
}
