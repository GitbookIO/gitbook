const DOCS_SUFFIX = ' Docs';
const DOCS_WORD_PATTERN = /\bdoc(s|umentation)?\b/i;

/**
 * Characters {@link getSiteMcpServerName} can add to a title, for callers that cap its length.
 */
export const SITE_MCP_SERVER_NAME_MAX_ADDED_LENGTH = DOCS_SUFFIX.length;

/**
 * Get the name a client lists a site's MCP server under: the site title, marked as docs unless it
 * already says so.
 */
export function getSiteMcpServerName(siteTitle: string): string {
    const title = siteTitle.trim();
    if (!title) {
        return DOCS_SUFFIX.trim();
    }

    // A customer often runs an MCP server for its own product, listed under the same name.
    return DOCS_WORD_PATTERN.test(title) ? title : `${title}${DOCS_SUFFIX}`;
}
