import { NextRequest } from 'next/server';

import { getSpace, getSite } from '@/lib/api';
import { getAbsoluteHref } from '@/lib/links';
import { getSiteContentPointer } from '@/lib/pointer';
import { isSpaceIndexable } from '@/lib/seo';

export const runtime = 'edge';

/**
 * Generate a robots.txt for the current space.
 */
export async function GET(req: NextRequest) {
    const pointer = await getSiteContentPointer();
    const [site, space] = await Promise.all([
        getSite(pointer.organizationId, pointer.siteId),
        getSpace(pointer.spaceId, pointer.siteShareKey),
    ]);

    const lines = [
        `User-agent: *`,
        'Disallow: /~gitbook/',
        ...((await isSpaceIndexable({ space, site }))
            ? [`Allow: /`, `Sitemap: ${await getAbsoluteHref(`/sitemap.xml`, true)}`]
            : [`Disallow: /`]),
    ];
    const content = lines.join('\n');

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
