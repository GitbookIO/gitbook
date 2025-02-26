import type { NextRequest } from 'next/server';

import { getSiteContentPointer } from '@/lib/pointer';
import { isSiteIndexable } from '@/lib/seo';
import { fetchV1ContextForSitePointer } from '@/lib/v1';

export const runtime = 'edge';

/**
 * Generate a robots.txt for the current space.
 */
export async function GET(_req: NextRequest) {
    const pointer = await getSiteContentPointer();
    const context = await fetchV1ContextForSitePointer(pointer);
    const { linker } = context;

    const lines = [
        'User-agent: *',
        'Disallow: /~gitbook/',
        ...((await isSiteIndexable(context))
            ? ['Allow: /', `Sitemap: ${linker.toAbsoluteURL(linker.toPathInSpace('/sitemap.xml'))}`]
            : ['Disallow: /']),
    ];
    const content = lines.join('\n');

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
