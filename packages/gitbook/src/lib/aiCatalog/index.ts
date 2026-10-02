import type { GitBookSiteContext } from '@/lib/context';
import { serveDiscoveryDocument } from '@/lib/discoveryDocument';
import { isSiteMcpEnabled } from '@/lib/mcp/endpoints';
import { MCP_SERVER_CARD_PATH } from '@/lib/mcp/paths';
import { SERVER_CARD_MEDIA_TYPE } from '@/lib/mcp/serverCard';

export const AI_CATALOG_MEDIA_TYPE = 'application/ai-catalog+json';
export const AI_CATALOG_SPEC_VERSION = '1.0';

/**
 * The AI Catalog a site publishes at `/.well-known/ai-catalog.json`, per the
 * [AI Catalog specification](https://github.com/Agent-Card/ai-catalog).
 */
export interface AiCatalog {
    /**
     * Required. The specification version, in "Major.Minor" form.
     */
    specVersion: string;
    /**
     * Required, and may be empty.
     */
    entries: AiCatalogEntry[];
}

export interface AiCatalogEntry {
    /**
     * Required. Domain-anchored `urn:air:{publisher}:{namespace}:{name}`.
     */
    identifier: string;
    /**
     * Required. The media type of the artifact the entry points at.
     */
    type: string;
    /**
     * Where the artifact can be retrieved. Exactly one of `url` or `data` is used.
     */
    url: string;
}

/**
 * Build the catalog of AI artifacts the site advertises, or `null` when it advertises none.
 */
export function buildSiteAiCatalog(context: GitBookSiteContext): AiCatalog | null {
    const { linker, site } = context;

    const entries: AiCatalogEntry[] = [];

    if (isSiteMcpEnabled(context)) {
        entries.push({
            identifier: buildCatalogIdentifier(context, 'mcp', site.id),
            type: SERVER_CARD_MEDIA_TYPE,
            url: linker.toAbsoluteURL(linker.toPathInSite(MCP_SERVER_CARD_PATH)),
        });
    }

    if (entries.length === 0) {
        return null;
    }

    return { specVersion: AI_CATALOG_SPEC_VERSION, entries };
}

/**
 * Serve the site's catalog, or a 404 when the site advertises nothing to discover.
 */
export async function serveSiteAiCatalog(
    context: GitBookSiteContext,
    request: Request
): Promise<Response> {
    const catalog = buildSiteAiCatalog(context);
    if (!catalog) {
        return new Response('Not Found', { status: 404 });
    }

    return serveDiscoveryDocument(context, request, {
        document: catalog,
        mediaType: AI_CATALOG_MEDIA_TYPE,
    });
}

function buildCatalogIdentifier(
    context: GitBookSiteContext,
    namespace: string,
    name: string
): string {
    const publisher = new URL(context.linker.toAbsoluteURL(context.linker.toPathInSite('')))
        .hostname;

    return `urn:air:${publisher}:${namespace}:${name}`;
}
