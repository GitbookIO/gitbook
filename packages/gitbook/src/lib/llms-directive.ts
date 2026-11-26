import type { RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import type { GitBookSiteContext } from './context';
import { getSiteMcpEndpoint, isSiteMcpEnabled } from './mcp/endpoints';

/**
 * Return the URL for the site-level llms.txt file.
 */
export function getLLMsTxtURL(context: GitBookSiteContext): string {
    return context.linker.toAbsoluteURL(context.linker.toPathInSite('llms.txt'));
}

/**
 * Return the URL for the markdown version of a page.
 */
export function getPageMarkdownURL(
    context: GitBookSiteContext,
    page: RevisionPageDocument | RevisionPageGroup
): string {
    return `${context.linker.toAbsoluteURL(context.linker.toPathInSpace(page.path))}.md`;
}

/**
 * Return the MCP endpoint to point agents to, or `undefined` when the site publishes none.
 */
export function getAdvertisedMcpEndpoint(context: GitBookSiteContext): string | undefined {
    return isSiteMcpEnabled(context) ? getSiteMcpEndpoint(context) : undefined;
}

/**
 * Render the sentence that points agents to the site's MCP server, or `undefined` when the site
 * publishes none.
 */
export function renderMcpMarkdownDirective(context: GitBookSiteContext): string | undefined {
    const mcpEndpoint = getAdvertisedMcpEndpoint(context);
    return mcpEndpoint
        ? `Agents can also search and read this documentation through its [MCP server](${mcpEndpoint}).`
        : undefined;
}

/**
 * Render the agent-facing directive that points agents to the site index.
 */
export function renderLLMsTxtMarkdownDirective(
    context: GitBookSiteContext,
    page: RevisionPageDocument | RevisionPageGroup
): string {
    const mcpDirective = renderMcpMarkdownDirective(context);
    return `> For the complete documentation index, see [llms.txt](${getLLMsTxtURL(context)}). Markdown versions of documentation pages are available by appending \`.md\` to page URLs; this page is available as [Markdown](${getPageMarkdownURL(context, page)}).${mcpDirective ? ` ${mcpDirective}` : ''}`;
}
