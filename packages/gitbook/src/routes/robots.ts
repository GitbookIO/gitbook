import { isSiteIndexable } from '@/lib/seo';
import { type GitBookSiteContext, checkIsRootSiteContext } from '@v2/lib/context';

/**
 * Generate a robots.txt for a site.
 */
export async function serveRobotsTxt(context: GitBookSiteContext) {
    const { linker } = context;

    const isRoot = checkIsRootSiteContext(context);
    const isIndexable = await isSiteIndexable(context);

    const lines = isIndexable
        ? [
              'User-agent: *',
              // Allow image resizing and icon generation routes for favicons and search results
              'Allow: /~gitbook/image?*',
              'Allow: /~gitbook/icon?*',
              // Disallow other dynamic routes / search queries
              'Disallow: /*?',
              'Allow: /',
              `Sitemap: ${linker.toAbsoluteURL(linker.toPathInSpace(isRoot ? '/sitemap.xml' : '/sitemap-pages.xml'))}`,
          ]
        : ['User-agent: *', 'Disallow: /'];

    const robotsTxt = lines.join('\n');
    return new Response(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
