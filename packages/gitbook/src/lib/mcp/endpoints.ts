import { CustomizationPageActionType, SiteVisibility } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';

/**
 * Whether the site publishes an MCP server at all. Gates the endpoint and everything describing it.
 */
export function isSiteMcpEnabled(context: GitBookSiteContext): boolean {
    return context.customization.pageActions.items.includes(CustomizationPageActionType.Mcp);
}

/**
 * Whether `~gitbook/mcp` endpoint requires auth for the site (i.e VA site).
 */
export function mcpEndpointRequiresAuth(context: GitBookSiteContext): boolean {
    return context.site.visibility === SiteVisibility.VisitorAuth;
}

/**
 * Whether the site exposes `~gitbook/mcp/auth`, the endpoint a visitor authenticates against to
 * read adaptive content.
 */
export function hasAdaptiveMcpEndpoint(context: GitBookSiteContext): boolean {
    return Boolean(
        !mcpEndpointRequiresAuth(context) &&
        context.site.adaptiveContent?.enabled &&
        context.site.urls.login
    );
}
