import { ContentVisibility } from '@gitbook/api';
import { NextRequest } from 'next/server';

import { getCollection, getSpace } from '@/lib/api';
import { absoluteHref } from '@/lib/links';
import { shouldIndexSpace } from '@/lib/seo';

import { getContentPointer } from '../../fetch';

export const runtime = 'edge';

/**
 * Generate a robots.txt for the current space.
 */
export async function GET(req: NextRequest) {
    const space = await getSpace(getContentPointer().spaceId);
    const collection =
        space.visibility === ContentVisibility.InCollection && space.parent
            ? await getCollection(space.parent)
            : null;

    const lines = [
        `User-agent: *`,
        'Disallow: /~gitbook/',
        ...(shouldIndexSpace({ space, collection })
            ? [`Allow: /`, `Sitemap: ${absoluteHref(`/sitemap.xml`, true)}`]
            : [`Disallow: /`]),
    ];
    const content = lines.join('\n');

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
