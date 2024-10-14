import { ContentVisibility } from '@gitbook/api';
import { NextRequest } from 'next/server';

import { getCollection, getSite, getSpace } from '@/lib/api';
import { absoluteHref } from '@/lib/links';
import { getSiteContentPointer } from '@/lib/pointer';
import { isSpaceIndexable } from '@/lib/seo';

export const runtime = 'edge';

/**
 * Generate a robots.txt for the current space.
 */
export async function GET(req: NextRequest) {
    const pointer = getSiteContentPointer();
    const [site, space] = await Promise.all([
        getSite(pointer.organizationId, pointer.siteId),
        getSpace(pointer.spaceId, pointer.siteShareKey),
    ]);

    const lines = [
        `User-agent: *`,
        'Disallow: /~gitbook/',
        ...(isSpaceIndexable({ space, site })
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
