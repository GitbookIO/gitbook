import { type GitBookSiteContext, checkIsRootSiteContext } from '@/lib/context';
import { isSiteIndexable } from '@/lib/seo';

/**
 * Generate a robots.txt for a site.
 */
export async function serveRobotsTxt(context: GitBookSiteContext) {
    const { linker } = context;

    const isRoot = checkIsRootSiteContext(context);
    const isIndexable = isSiteIndexable(context);

    const sitemapPath = linker.toPathInSpace(isRoot ? '/sitemap.xml' : '/sitemap-pages.xml');
    const sitemapUrl = linker.toAbsoluteURL(sitemapPath);

    const lines = isIndexable
        ? [
              'User-agent: *',
              'Content-Signal: ai-train=yes, search=yes, ai-input=yes',
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
        : ['User-agent: *', 'Content-Signal: ai-train=no, search=no, ai-input=no', 'Disallow: /'];

    return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain' } });
}
