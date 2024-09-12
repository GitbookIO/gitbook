import { ContentVisibility } from '@gitbook/api';
import { NextRequest } from 'next/server';

import { getCollection, getSite, getSpace } from '@/lib/api';
import { absoluteHref } from '@/lib/links';
import { shouldIndexSpace } from '@/lib/seo';

import { getSiteContentPointer } from '../../fetch';

export const runtime = 'edge';

/**
 * Generate a robots.txt for the current space.
 */
export async function GET(req: NextRequest) {
    const pointer = getSiteContentPointer();
    const space = await getSpace(pointer.spaceId, pointer.siteShareKey);
    const parent = await getSite(pointer.organizationId, pointer.siteId);

    const lines = [
        `User-agent: *`,
        'Disallow: /~gitbook/',
        ...(shouldIndexSpace({ space, parent })
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
