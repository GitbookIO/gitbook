/**
 * Replaces `redis` in the server bundle (see next.config.mjs). mcp-handler imports it statically
 * but only uses it for SSE transport, which we disable.
 */
export function createClient(): never {
    throw new Error('redis is not available: SSE transport is disabled for the MCP handler');
}
