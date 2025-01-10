import { NextRequest } from 'next/server';

import { getSpace, getSite } from '@/lib/api';
import { getGitBookContextFromHeaders } from '@/lib/gitbook-context';
import { getAbsoluteHref } from '@/lib/links';
import { getSiteContentPointer } from '@/lib/pointer';
import { isSpaceIndexable } from '@/lib/seo';

export const runtime = 'edge';

/**
 * Generate a robots.txt for the current space.
 */
export async function GET(req: NextRequest) {
    const ctx = getGitBookContextFromHeaders(req.headers);
    const pointer = getSiteContentPointer(ctx);
    const [site, space] = await Promise.all([
        getSite(ctx, pointer.organizationId, pointer.siteId),
        getSpace(ctx, pointer.spaceId, pointer.siteShareKey),
    ]);

    const lines = [
        `User-agent: *`,
        'Disallow: /~gitbook/',
        ...(isSpaceIndexable(ctx, { space, site })
            ? [`Allow: /`, `Sitemap: ${getAbsoluteHref(ctx, `/sitemap.xml`, true)}`]
            : [`Disallow: /`]),
    ];
    const content = lines.join('\n');

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
