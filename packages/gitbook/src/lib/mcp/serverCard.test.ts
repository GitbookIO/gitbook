import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, expect, it } from 'bun:test';

import { CustomizationAIMode, CustomizationPageActionType, SiteVisibility } from '@gitbook/api';

import { hasAdaptiveMcpEndpoint, mcpEndpointRequiresAuth } from './endpoints';
import {
    MCP_SERVER_INFO,
    SERVER_CARD_MEDIA_TYPE,
    SERVER_CARD_SCHEMA_URL,
    type SiteMcpServerCard,
    buildSiteMcpServerCard,
    serveSiteMcpServerCard,
} from './serverCard';
import { createSiteMcpTools, registerSiteMcpTools } from './tools';
import type { GitBookSiteContext } from '@/lib/context';
import { createLinker } from '@/lib/links';

const SERVER_CARD_NAME_PATTERN = /^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/;
const MAX_TEXT_LENGTH = 100;

function makeContext(
    options: {
        host?: string;
        siteBasePath?: string;
        spaceBasePath?: string;
        siteId?: string;
        title?: string;
        visibility?: SiteVisibility;
        adaptiveContent?: boolean;
        aiMode?: CustomizationAIMode;
        pageActions?: CustomizationPageActionType[];
    } = {}
): GitBookSiteContext {
    const {
        host = 'docs.acme.org',
        siteBasePath = '/',
        spaceBasePath = siteBasePath,
        siteId = 'site_123',
        title = 'Acme',
        visibility = SiteVisibility.Public,
        adaptiveContent = true,
        aiMode = CustomizationAIMode.Search,
        pageActions = [CustomizationPageActionType.Mcp],
    } = options;

    return {
        organizationId: 'org_123',
        site: {
            id: siteId,
            title,
            visibility,
            adaptiveContent: { enabled: adaptiveContent },
            urls: { login: `https://${host}/~gitbook/auth/login` },
        },
        siteSpace: { urls: { published: `https://${host}${siteBasePath}` } },
        customization: {
            ai: { mode: aiMode },
            pageActions: { items: pageActions },
        },
        linker: createLinker({ host, siteBasePath, spaceBasePath }),
    } as unknown as GitBookSiteContext;
}

function buildCard(options?: Parameters<typeof makeContext>[0]): SiteMcpServerCard {
    const context = makeContext(options);
    const request = new Request('https://docs.acme.org/~gitbook/mcp/server-card');
    return buildSiteMcpServerCard(context, createSiteMcpTools(context, { request }));
}

describe('buildSiteMcpServerCard', () => {
    describe('schema constraints', () => {
        it('declares every required member', () => {
            const card = buildCard();

            expect(card.$schema).toBe(SERVER_CARD_SCHEMA_URL);
            expect(card.name).toBeString();
            expect(card.version).toBeString();
            expect(card.description).toBeString();
        });

        it('names the server with a reverse-DNS namespace and exactly one slash', () => {
            const card = buildCard({ siteId: 'site_A1b2-c3' });

            expect(card.name).toBe('com.gitbook.sites.mcp/site_A1b2-c3');
            expect(card.name).toMatch(SERVER_CARD_NAME_PATTERN);
            expect(card.name.split('/')).toHaveLength(2);
        });

        it('keeps the description and title within 100 characters', () => {
            const card = buildCard({ title: 'Acme' });

            expect(card.title).toBe('Acme MCP Server');
            expect(card.description).toBe('Search and read the Acme documentation over MCP.');
            expect(card.description.length).toBeLessThanOrEqual(MAX_TEXT_LENGTH);
            expect(card.title.length).toBeLessThanOrEqual(MAX_TEXT_LENGTH);
        });

        it('does not repeat an article a customer title already carries', () => {
            const card = buildCard({ title: 'The Acme Handbook' });

            expect(card.title).toBe('The Acme Handbook MCP Server');
            expect(card.description).toBe(
                'Search and read The Acme Handbook documentation over MCP.'
            );
        });

        it('truncates an arbitrarily long customer title without losing what the server is', () => {
            const card = buildCard({ title: 'A'.repeat(500) });

            expect(card.title.length).toBe(MAX_TEXT_LENGTH);
            expect(card.title.endsWith('… MCP Server')).toBe(true);
            expect(card.description.length).toBe(MAX_TEXT_LENGTH);
            expect(card.description.startsWith('Search and read the ')).toBe(true);
            expect(card.description.endsWith('… documentation over MCP.')).toBe(true);
        });

        it('publishes an exact version rather than a range', () => {
            const card = buildCard();

            expect(card.version).toMatch(/^\d+\.\d+\.\d+/);
            expect(card.version).toBe(MCP_SERVER_INFO.version);
        });

        it('declares a transport type the extension allows on every remote', () => {
            const card = buildCard();

            for (const remote of card.remotes) {
                expect(['streamable-http', 'sse']).toContain(remote.type);
                expect(URL.canParse(remote.url)).toBe(true);
                expect(remote.supportedProtocolVersions.length).toBeGreaterThan(0);
            }
        });
    });

    describe('server identity', () => {
        it('reports the same identity the transport reports at initialize', () => {
            const card = buildCard();

            expect(card.serverInfo).toEqual({ ...MCP_SERVER_INFO });
            expect(card.version).toBe(card.serverInfo.version);
        });

        it('points `endpoint` at the same URL as the public remote', () => {
            const card = buildCard();

            expect(card.endpoint).toBe(card.remotes[0]?.url ?? '');
        });
    });

    describe('remotes', () => {
        it('publishes one card with both endpoints when the site serves adaptive content', () => {
            const card = buildCard({ adaptiveContent: true });

            expect(card.remotes.map((remote) => remote.url)).toEqual([
                'https://docs.acme.org/~gitbook/mcp',
                'https://docs.acme.org/~gitbook/mcp/auth',
            ]);
            expect(card.remotes[0]?.headers).toBeUndefined();
            expect(card.remotes[1]?.headers).toEqual([
                {
                    name: 'Authorization',
                    description: expect.stringContaining('Bearer token'),
                    isRequired: true,
                    isSecret: true,
                },
            ]);
        });

        it('omits the adaptive endpoint when the site has no adaptive content', () => {
            const card = buildCard({ adaptiveContent: false });

            expect(card.remotes.map((remote) => remote.url)).toEqual([
                'https://docs.acme.org/~gitbook/mcp',
            ]);
            expect(card.remotes[0]?.headers).toBeUndefined();
        });

        it.each([SiteVisibility.Public, SiteVisibility.Unlisted, SiteVisibility.ShareLink])(
            'leaves the public endpoint unauthenticated on a %s site',
            (visibility) => {
                const card = buildCard({ visibility, adaptiveContent: false });

                expect(card.remotes[0]?.headers).toBeUndefined();
            }
        );

        it('requires a token on the public endpoint of a visitor-auth site, and offers no adaptive endpoint', () => {
            const card = buildCard({ visibility: SiteVisibility.VisitorAuth });

            expect(card.remotes.map((remote) => remote.url)).toEqual([
                'https://docs.acme.org/~gitbook/mcp',
            ]);
            expect(card.remotes[0]?.headers).toEqual([
                {
                    name: 'Authorization',
                    description: expect.stringContaining('restricted to authenticated visitors'),
                    isRequired: true,
                    isSecret: true,
                },
            ]);
        });
    });

    describe('urls', () => {
        it.each([
            {
                scenario: 'a custom domain',
                options: { host: 'docs.acme.org', siteBasePath: '/' },
                websiteUrl: 'https://docs.acme.org',
                endpoint: 'https://docs.acme.org/~gitbook/mcp',
                icon: 'https://docs.acme.org/~gitbook/icon?size=medium',
            },
            {
                scenario: 'a gitbook.io subdomain',
                options: { host: 'acme.gitbook.io', siteBasePath: '/' },
                websiteUrl: 'https://acme.gitbook.io',
                endpoint: 'https://acme.gitbook.io/~gitbook/mcp',
                icon: 'https://acme.gitbook.io/~gitbook/icon?size=medium',
            },
            {
                scenario: 'a subpath site',
                options: {
                    host: 'gitbook.com',
                    siteBasePath: '/docs/',
                    spaceBasePath: '/docs/v1/',
                },
                websiteUrl: 'https://gitbook.com/docs',
                endpoint: 'https://gitbook.com/docs/~gitbook/mcp',
                icon: 'https://gitbook.com/docs/~gitbook/icon?size=medium',
            },
        ])('builds absolute URLs for $scenario', ({ options, websiteUrl, endpoint, icon }) => {
            const card = buildCard(options);

            expect(card.websiteUrl).toBe(websiteUrl);
            expect(card.endpoint).toBe(endpoint);
            expect(card.remotes[1]?.url).toBe(`${endpoint}/auth`);
            expect(card.icons[0]?.src).toBe(icon);
        });
    });

    describe('endpoint predicates', () => {
        it.each([
            {
                scenario: 'a public site with adaptive content',
                options: { visibility: SiteVisibility.Public, adaptiveContent: true },
                requiresAuth: false,
                hasAdaptive: true,
            },
            {
                scenario: 'a public site without adaptive content',
                options: { visibility: SiteVisibility.Public, adaptiveContent: false },
                requiresAuth: false,
                hasAdaptive: false,
            },
            {
                scenario: 'a visitor-auth site',
                options: { visibility: SiteVisibility.VisitorAuth, adaptiveContent: true },
                requiresAuth: true,
                hasAdaptive: false,
            },
        ])('resolves the endpoints of $scenario', ({ options, requiresAuth, hasAdaptive }) => {
            const context = makeContext(options);

            expect(mcpEndpointRequiresAuth(context)).toBe(requiresAuth);
            expect(hasAdaptiveMcpEndpoint(context)).toBe(hasAdaptive);
        });
    });

    describe('tools', () => {
        it('advertises exactly the tools registered on the server', () => {
            const context = makeContext();
            const request = new Request('https://docs.acme.org/~gitbook/mcp');
            const tools = createSiteMcpTools(context, { request });

            const registered: string[] = [];
            registerSiteMcpTools(
                { tool: (name: string) => registered.push(name) } as unknown as McpServer,
                tools
            );

            const card = buildSiteMcpServerCard(context, tools);
            expect(card.tools.map((tool) => tool.name)).toEqual(registered);
        });

        it('carries a description and annotations, but not input schemas', () => {
            const card = buildCard();
            const search = card.tools.find((tool) => tool.name === 'searchDocumentation');

            expect(search?.description).toContain('Acme');
            expect(search?.annotations).toMatchObject({
                title: 'Search documentation',
                readOnlyHint: true,
            });
            expect(search).not.toHaveProperty('inputSchema');
        });

        it('omits askQuestion when the site has no AI mode', () => {
            const withAI = buildCard({ aiMode: CustomizationAIMode.Assistant });
            const withoutAI = buildCard({ aiMode: CustomizationAIMode.None });

            expect(withAI.tools.map((tool) => tool.name)).toEqual([
                'searchDocumentation',
                'getPage',
                'askQuestion',
                'sendFeedback',
            ]);
            expect(withoutAI.tools.map((tool) => tool.name)).toEqual([
                'searchDocumentation',
                'getPage',
                'sendFeedback',
            ]);
        });
    });
});

describe('serveSiteMcpServerCard', () => {
    const cardRequest = (init?: RequestInit) =>
        new Request('https://docs.acme.org/~gitbook/mcp/server-card', init);

    it('serves the card with the media type and CORS headers the extension requires', async () => {
        const res = await serveSiteMcpServerCard(makeContext(), cardRequest());

        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toBe(`${SERVER_CARD_MEDIA_TYPE}; charset=utf-8`);
        expect(res.headers.get('access-control-allow-origin')).toBe('*');
        expect(res.headers.get('access-control-allow-methods')).toBe('GET');
        expect(res.headers.get('access-control-allow-headers')).toBe('Content-Type, If-None-Match');
        expect(res.headers.get('access-control-expose-headers')).toBe('ETag');

        const card = (await res.json()) as SiteMcpServerCard;
        expect(card.$schema).toBe(SERVER_CARD_SCHEMA_URL);
    });

    it('answers a preflight with a 204', async () => {
        const res = await serveSiteMcpServerCard(makeContext(), cardRequest({ method: 'OPTIONS' }));

        expect(res.status).toBe(204);
        expect(res.headers.get('access-control-allow-origin')).toBe('*');
    });

    it('returns 304 when the client already has the current card', async () => {
        const context = makeContext();
        const first = await serveSiteMcpServerCard(context, cardRequest());
        const etag = first.headers.get('etag');
        expect(etag).toBeTruthy();

        const revalidated = await serveSiteMcpServerCard(
            context,
            cardRequest({ headers: { 'If-None-Match': `W/${etag}` } })
        );

        expect(revalidated.status).toBe(304);
        expect(revalidated.headers.get('etag')).toBe(etag);
    });

    it.each([
        { visibility: SiteVisibility.Public, cacheControl: 'public, max-age=3600' },
        { visibility: SiteVisibility.Unlisted, cacheControl: 'public, max-age=3600' },
        { visibility: SiteVisibility.ShareLink, cacheControl: 'no-store' },
        { visibility: SiteVisibility.VisitorAuth, cacheControl: 'no-store' },
    ])('caches a $visibility site with $cacheControl', async ({ visibility, cacheControl }) => {
        const res = await serveSiteMcpServerCard(makeContext({ visibility }), cardRequest());

        expect(res.headers.get('cache-control')).toBe(cacheControl);
    });

    it.each([
        { scenario: 'no page action is enabled', pageActions: [] },
        {
            scenario: 'another page action is enabled',
            pageActions: [CustomizationPageActionType.Markdown],
        },
    ])('does not serve a card when $scenario', async ({ pageActions }) => {
        const res = await serveSiteMcpServerCard(makeContext({ pageActions }), cardRequest());

        expect(res.status).toBe(404);
    });
});
