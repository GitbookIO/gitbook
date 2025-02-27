import { isSiteIndexable } from '@/lib/seo';
import type { GitBookSiteContext } from '@v2/lib/context';

/**
 * Generate a robots.txt for a site.
 */
export async function serveRobotsTxt(context: GitBookSiteContext, _req: Request) {
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
