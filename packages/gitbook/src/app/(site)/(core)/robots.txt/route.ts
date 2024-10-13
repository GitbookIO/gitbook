import { ContentVisibility } from '@gitbook/api';
import { NextRequest } from 'next/server';

import { getCollection, getSite, getSpace } from '@/lib/api';
import { absoluteHref } from '@/lib/links';
import { isSpaceIndexable } from '@/lib/seo';

import { getContentPointer } from '../../fetch';

export const runtime = 'edge';

/**
 * Generate a robots.txt for the current space.
 */
export async function GET(req: NextRequest) {
    const pointer = getContentPointer();
    const space = await getSpace(
        pointer.spaceId,
        'siteId' in pointer ? pointer.siteShareKey : undefined,
    );
    const site = 'siteId' in pointer ? await getSite(pointer.organizationId, pointer.siteId) : null;

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
