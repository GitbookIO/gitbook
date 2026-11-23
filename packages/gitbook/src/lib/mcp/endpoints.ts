import { CustomizationPageActionType, SiteVisibility } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';

/**
 * Whether the site serves its MCP endpoint. Falls back to the `mcp` page action for cached
 * customizations that predate the setting.
 */
export function isSiteMcpEnabled(context: Pick<GitBookSiteContext, 'customization'>): boolean {
    // DO NOT MERGE - mocking type for development
    const mcp = (context.customization as { mcp?: { enabled: boolean } }).mcp;
    if (mcp) {
        return mcp.enabled;
    }
    return context.customization.pageActions.items.includes(CustomizationPageActionType.Mcp);
}

/**
 * Whether the site advertises its MCP server to visitors: the endpoint is served and the
 * "Connect with MCP server" page action is enabled for this visitor.
 */
export function isMcpPageActionEnabled(
    context: Pick<GitBookSiteContext, 'customization'>
): boolean {
    return (
        isSiteMcpEnabled(context) &&
        context.customization.pageActions.items.includes(CustomizationPageActionType.Mcp)
    );
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
