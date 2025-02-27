import { isSiteIndexable } from '@/lib/seo';
import { type GitBookSiteContext, checkIsRootSiteContext } from '@v2/lib/context';

/**
 * Generate a robots.txt for a site.
 */
export async function serveRobotsTxt(context: GitBookSiteContext) {
    const { linker } = context;

    const isRoot = checkIsRootSiteContext(context);
    const lines = [
        'User-agent: *',
        'Disallow: /~gitbook/',
        ...((await isSiteIndexable(context))
            ? [
                  'Allow: /',
                  `Sitemap: ${linker.toAbsoluteURL(linker.toPathInContent(isRoot ? '/sitemap.xml' : '/sitemap-pages.xml'))}`,
              ]
            : ['Disallow: /']),
    ];
    const content = lines.join('\n');

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
