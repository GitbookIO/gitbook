/**
 * Path the card is served on, appended to the Streamable HTTP endpoint as the extension reserves
 * (`GET <streamable-http-url>/server-card`).
 */
export const MCP_SERVER_CARD_PATH = '~gitbook/mcp/server-card';

/**
 * Path crawlers probe today, kept alongside the reserved one. The extension argues against
 * `.well-known` for a single server's card (it is application-level, not site-wide metadata), but
 * the scanners in the wild look here, so the card answers on both.
 */
export const MCP_SERVER_CARD_WELL_KNOWN_PATH = '.well-known/mcp/server-card.json';
