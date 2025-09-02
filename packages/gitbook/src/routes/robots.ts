import { type GitBookSiteContext, checkIsRootSiteContext } from '@/lib/context';
import { isSiteIndexable } from '@/lib/seo';

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
              // Disallow other dynamic routes / search queries
              'Disallow: /*?',
              // Allow image resizing and icon generation routes for favicons and search results
              'Allow: /~gitbook/image?*',
              'Allow: /~gitbook/icon?*',
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
