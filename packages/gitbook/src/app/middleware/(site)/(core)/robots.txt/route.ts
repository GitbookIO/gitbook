import { NextRequest } from 'next/server';

import { getSite } from '@/lib/api';
import { getAbsoluteHref } from '@/lib/links';
import { getSiteContentPointer } from '@/lib/pointer';
import { isSiteIndexable } from '@/lib/seo';

export const runtime = 'edge';

/**
 * Generate a robots.txt for the current space.
 */
export async function GET(req: NextRequest) {
    const pointer = await getSiteContentPointer();
    const site = await getSite(pointer.organizationId, pointer.siteId);

    const lines = [
        `User-agent: *`,
        'Disallow: /~gitbook/',
        ...((await isSiteIndexable(site))
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
