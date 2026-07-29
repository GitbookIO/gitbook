import { type GitBookSiteContext, checkIsRootSiteContext } from '@/lib/context';
import { isSiteIndexable } from '@/lib/seo';
import { SiteVisibility } from '@gitbook/api';

/**
 * User-agents of AI assistants that fetch pages live in response to a user prompt.
 * These are allowed to read pages even when the site is not indexable in search
 * engines, so end-users can pull content into an LLM without needing an MCP
 * connection — including when they ask their assistant to fetch a specific URL.
 */
const AI_USER_AGENTS = ['ChatGPT-User', 'Claude-User', 'Perplexity-User'];

/**
 * Generate a robots.txt for a site.
 */
export async function serveRobotsTxt(context: GitBookSiteContext) {
    const { linker } = context;

    const isRoot = checkIsRootSiteContext(context);
    const isIndexable = isSiteIndexable(context);
    const isSitePublic = context.site.visibility === SiteVisibility.Public;

    const sitemapPath = linker.toPathInSpace(isRoot ? '/sitemap.xml' : '/sitemap-pages.xml');
    const sitemapUrl = linker.toAbsoluteURL(sitemapPath);

    const lines = isIndexable
        ? [
              'User-agent: *',
              'Content-Signal: ai-train=yes, search=yes, ai-input=yes',
              // Internal search (?q= / ?ask=) is left crawlable and served noindex via middleware.
              // Allow dynamic assets (may include ?)
              'Allow: /~gitbook/image?*',
              'Allow: /~gitbook/icon?*',
              'Allow: /favicon.ico',
              'Allow: /',
              `Sitemap: ${sitemapUrl}`,
          ]
        : [
              // Allow user-triggered AI assistants to read pages even when the
              // site is not indexable, so end-users can pull content into an LLM.
              // Training crawlers and search engines remain blocked.
              // If site is not public, we don't allow it.
              ...(isSitePublic
                  ? AI_USER_AGENTS.flatMap((userAgent) => [
                        `User-agent: ${userAgent}`,
                        'Content-Signal: ai-train=no, search=no, ai-input=yes',
                        'Allow: /',
                        '',
                    ])
                  : []),
              'User-agent: *',
              'Content-Signal: ai-train=no, search=no, ai-input=no',
              'Disallow: /',
          ];

    return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain' } });
}
