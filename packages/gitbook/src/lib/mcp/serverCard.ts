import type { Implementation, ServerCapabilities, Tool } from '@modelcontextprotocol/sdk/types.js';
import { SUPPORTED_PROTOCOL_VERSIONS } from '@modelcontextprotocol/sdk/types.js';

import packageJSON from '../../../package.json';
import { hasAdaptiveMcpEndpoint, isSiteMcpEnabled, mcpEndpointRequiresAuth } from './endpoints';
import { type SiteMcpTool, createSiteMcpTools } from './tools';
import type { GitBookSiteContext } from '@/lib/context';
import { serveDiscoveryDocument } from '@/lib/discoveryDocument';

export const SERVER_CARD_MEDIA_TYPE = 'application/mcp-server-card+json';
export const SERVER_CARD_SCHEMA_URL =
    'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json';

/**
 * Namespace for every published site's card.
 */
const SERVER_CARD_NAMESPACE = 'com.gitbook.sites.mcp';

/**
 * Version reported on the card and at `initialize` alike, so the two cannot drift.
 */
export const MCP_SERVER_VERSION = packageJSON.version;

const MAX_TEXT_LENGTH = 100;

const TITLE_SUFFIX = ' MCP Server';
const DESCRIPTION_PREFIX = 'Search and read ';
const DESCRIPTION_ARTICLE = 'the ';
const DESCRIPTION_SUFFIX = ' documentation over MCP.';

/**
 * A site's MCP Server Card, as defined by
 * [SEP-2127](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127).
 *
 * Its schema is still experimental and published neither on npm nor at the `$schema` URL it pins,
 * so the fields we serve are declared here and their constraints are checked in `serverCard.test.ts`.
 */
export interface SiteMcpServerCard {
    /**
     * Required, and exactly {@link SERVER_CARD_SCHEMA_URL}.
     */
    $schema: string;
    /**
     * Required. Reverse-DNS, with exactly one slash separating namespace from server name.
     */
    name: string;
    /**
     * Required. The version the server reports at `initialize`.
     */
    version: string;
    /**
     * Required, and at most 100 characters.
     */
    description: string;
    /**
     * Display name, at most 100 characters.
     */
    title: string;
    websiteUrl: string;
    icons: {
        src: string;
        mimeType?: string;
        sizes?: string[];
    }[];
    remotes: SiteMcpServerCardRemote[];
    serverInfo: SiteMcpServerInfo;
    /**
     * The Streamable HTTP endpoint, the same URL as `remotes[0].url`.
     */
    endpoint: string;
    capabilities: ServerCapabilities;
    tools: SiteMcpServerCardTool[];
}

/**
 * Identity the server reports at `initialize`, republished on the card so a card.
 */
export type SiteMcpServerInfo = Implementation & {
    /**
     * Required here, though the SDK leaves it optional: a client with no card to read has nothing
     * else to display, since `name` is the Streamable HTTP endpoint without its scheme.
     */
    title: string;
};

export interface SiteMcpServerCardRemote {
    type: 'streamable-http' | 'sse';
    url: string;
    supportedProtocolVersions: string[];
    headers?: {
        name: string;
        description: string;
        isRequired: boolean;
        isSecret: boolean;
    }[];
}

/**
 * One tool the server registers, as a client sees it from `tools/list` minus the input schema:
 * `tools/list` stays authoritative for that.
 */
export type SiteMcpServerCardTool = Pick<Tool, 'name' | 'description' | 'annotations'>;

/**
 * Build the card for a site's MCP server: the metadata an agent can read before it connects.
 */
export function buildSiteMcpServerCard(
    context: GitBookSiteContext,
    tools: SiteMcpTool[]
): SiteMcpServerCard {
    const { linker, site } = context;

    const endpoint = getSiteMcpEndpoint(context);
    const serverInfo = buildMcpServerInfo(context);

    return {
        $schema: SERVER_CARD_SCHEMA_URL,
        // Not the endpoint: the schema allows exactly one slash and no `~`, and a registry keys on
        // this, so it stays put when a customer moves the site to another domain.
        name: `${SERVER_CARD_NAMESPACE}/${site.id}`,
        version: serverInfo.version,
        title: serverInfo.title,
        description: buildDescription(site.title),
        websiteUrl: linker.toAbsoluteURL(linker.toPathInSite('')),
        icons: [
            {
                src: linker.toAbsoluteURL(linker.toPathInSite('~gitbook/icon?size=medium')),
                mimeType: 'image/png',
                sizes: ['180x180'],
            },
        ],
        remotes: buildRemotes(context, endpoint),
        serverInfo,
        endpoint,
        // What the SDK declares at `initialize` for a server with registered tools. A card that
        // said otherwise would contradict the live connection.
        capabilities: { tools: { listChanged: true } },
        tools: tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            annotations: tool.annotations,
        })),
    };
}

/**
 * Build the identity the server reports at `initialize`, which the card republishes verbatim.
 */
export function buildMcpServerInfo(context: GitBookSiteContext): SiteMcpServerInfo {
    const endpoint = new URL(getSiteMcpEndpoint(context));

    return {
        name: `${endpoint.host}${endpoint.pathname}`,
        title: buildTitle(context.site.title),
        version: MCP_SERVER_VERSION,
    };
}

export function getSiteMcpEndpoint(context: GitBookSiteContext): string {
    return context.linker.toAbsoluteURL(context.linker.toPathInSite('~gitbook/mcp'));
}

/**
 * Serve a site's MCP server card.
 *
 * A card names the site and lists its tools, so it is gated exactly like the MCP endpoint it
 * describes.
 */
export async function serveSiteMcpServerCard(
    context: GitBookSiteContext,
    request: Request
): Promise<Response> {
    if (!isSiteMcpEnabled(context)) {
        return new Response('Not Found', { status: 404 });
    }

    return serveDiscoveryDocument(context, request, {
        document: buildSiteMcpServerCard(context, createSiteMcpTools(context, { request })),
        mediaType: SERVER_CARD_MEDIA_TYPE,
    });
}

/**
 * Returns the info of the MCP endpoints a client can connect to.
 */
function buildRemotes(context: GitBookSiteContext, endpoint: string): SiteMcpServerCardRemote[] {
    const { linker } = context;

    const remotes: SiteMcpServerCardRemote[] = [
        {
            type: 'streamable-http',
            url: endpoint,
            supportedProtocolVersions: [...SUPPORTED_PROTOCOL_VERSIONS],
            ...(mcpEndpointRequiresAuth(context)
                ? {
                      headers: authorizationHeader(
                          'Bearer token obtained from the OAuth 2.0 flow advertised at /.well-known/oauth-protected-resource/~gitbook/mcp. This site is restricted to authenticated visitors.'
                      ),
                  }
                : {}),
        },
    ];

    if (hasAdaptiveMcpEndpoint(context)) {
        remotes.push({
            type: 'streamable-http',
            url: linker.toAbsoluteURL(linker.toPathInSite('~gitbook/mcp/auth')),
            supportedProtocolVersions: [...SUPPORTED_PROTOCOL_VERSIONS],
            headers: authorizationHeader(
                'Bearer token obtained from the OAuth 2.0 flow advertised at /.well-known/oauth-protected-resource/~gitbook/mcp/auth. Serves the content adapted to the authenticated visitor; connect to the public endpoint to read the site as an anonymous one.'
            ),
        });
    }

    return remotes;
}

function authorizationHeader(description: string): SiteMcpServerCardRemote['headers'] {
    return [{ name: 'Authorization', description, isRequired: true, isSecret: true }];
}

/**
 * Name the server after the site it serves, within the 100 characters the schema allows a `title`.
 */
function buildTitle(siteTitle: string): string {
    return `${truncate(siteTitle, MAX_TEXT_LENGTH - TITLE_SUFFIX.length)}${TITLE_SUFFIX}`;
}

/**
 * Fit the site's title into the 100 characters the schema allows a `description`.
 */
function buildDescription(siteTitle: string): string {
    // Drop the article for a title that carries its own, which would read "read the The Acme Docs".
    const article = /^the\s/i.test(siteTitle.trim()) ? '' : DESCRIPTION_ARTICLE;
    const budget =
        MAX_TEXT_LENGTH - DESCRIPTION_PREFIX.length - article.length - DESCRIPTION_SUFFIX.length;
    return `${DESCRIPTION_PREFIX}${article}${truncate(siteTitle, budget)}${DESCRIPTION_SUFFIX}`;
}

function truncate(value: string, maxLength: number): string {
    const normalized = value.trim();
    return normalized.length <= maxLength
        ? normalized
        : `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}
