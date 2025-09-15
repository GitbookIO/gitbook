import { type GitBookSiteContext, checkIsRootSiteContext } from '@/lib/context';
import { isSiteIndexable } from '@/lib/seo';

/**
 * Generate a robots.txt for a site.
 */
export async function serveRobotsTxt(context: GitBookSiteContext) {
    const { linker } = context;

    const isRoot = checkIsRootSiteContext(context);
    const isIndexable = await isSiteIndexable(context);

    const sitemapPath = linker.toPathInSpace(isRoot ? '/sitemap.xml' : '/sitemap-pages.xml');
    const sitemapUrl = linker.toAbsoluteURL(sitemapPath);

    const lines = isIndexable
        ? [
              'User-agent: *',
              // Disallow only internal search
              'Disallow: /*?*q=*',
              'Disallow: /*?*ask=*',
              // Allow dynamic assets (may include ?)
              'Allow: /~gitbook/image?*',
              'Allow: /~gitbook/icon?*',
              'Allow: /favicon.ico',
              'Allow: /',
              `Sitemap: ${sitemapUrl}`,
          ]
        : ['User-agent: *', 'Disallow: /'];

    return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain' } });
}
