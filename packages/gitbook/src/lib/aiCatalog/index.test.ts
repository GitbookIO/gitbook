import { describe, expect, it } from 'bun:test';

import { CustomizationPageActionType, SiteVisibility } from '@gitbook/api';

import {
    AI_CATALOG_MEDIA_TYPE,
    AI_CATALOG_SPEC_VERSION,
    type AiCatalog,
    buildSiteAiCatalog,
    serveSiteAiCatalog,
} from '.';
import type { GitBookSiteContext } from '@/lib/context';
import { createLinker } from '@/lib/links';

/**
 * `urn:air:{publisher}:{namespace}:{name}`, per the AI Catalog specification.
 */
const AIR_URN_PATTERN = /^urn:air:[^:]+:[^:]+:[^:]+$/;

function makeContext(
    options: {
        host?: string;
        siteBasePath?: string;
        siteId?: string;
        visibility?: SiteVisibility;
        pageActions?: CustomizationPageActionType[];
    } = {}
): GitBookSiteContext {
    const {
        host = 'docs.acme.org',
        siteBasePath = '/',
        siteId = 'site_123',
        visibility = SiteVisibility.Public,
        pageActions = [CustomizationPageActionType.Mcp],
    } = options;

    return {
        site: { id: siteId, title: 'Acme', visibility },
        customization: { pageActions: { items: pageActions } },
        linker: createLinker({ host, siteBasePath, spaceBasePath: siteBasePath }),
    } as unknown as GitBookSiteContext;
}

describe('buildSiteAiCatalog', () => {
    it('advertises the site MCP server card', () => {
        const catalog = buildSiteAiCatalog(makeContext());

        expect(catalog).toEqual({
            specVersion: AI_CATALOG_SPEC_VERSION,
            entries: [
                {
                    identifier: 'urn:air:docs.acme.org:mcp:site_123',
                    type: 'application/mcp-server-card+json',
                    url: 'https://docs.acme.org/~gitbook/mcp/server-card',
                },
            ],
        });
    });

    it('builds an identifier the specification can parse', () => {
        const catalog = buildSiteAiCatalog(makeContext({ siteId: 'site_A1b2-c3' }));

        expect(catalog?.entries[0]?.identifier).toMatch(AIR_URN_PATTERN);
    });

    it('omits fields the referenced card is authoritative for', () => {
        const entry = buildSiteAiCatalog(makeContext())?.entries[0];

        expect(entry).not.toHaveProperty('displayName');
        expect(entry).not.toHaveProperty('description');
        expect(entry).not.toHaveProperty('version');
    });

    it.each([
        {
            scenario: 'a custom domain',
            options: { host: 'docs.acme.org', siteBasePath: '/' },
            identifier: 'urn:air:docs.acme.org:mcp:site_123',
            url: 'https://docs.acme.org/~gitbook/mcp/server-card',
        },
        {
            scenario: 'a gitbook.io subdomain',
            options: { host: 'acme.gitbook.io', siteBasePath: '/' },
            identifier: 'urn:air:acme.gitbook.io:mcp:site_123',
            url: 'https://acme.gitbook.io/~gitbook/mcp/server-card',
        },
        {
            scenario: 'a subpath site',
            options: { host: 'gitbook.com', siteBasePath: '/docs/' },
            identifier: 'urn:air:gitbook.com:mcp:site_123',
            url: 'https://gitbook.com/docs/~gitbook/mcp/server-card',
        },
    ])('anchors the entry to $scenario', ({ options, identifier, url }) => {
        const entry = buildSiteAiCatalog(makeContext(options))?.entries[0];

        expect(entry?.identifier).toBe(identifier);
        expect(entry?.url).toBe(url);
    });

    it('drops the port from the publisher, which a URN would read as a separator', () => {
        const context = makeContext();
        const linker = createLinker({
            host: 'localhost:3000',
            siteBasePath: '/',
            spaceBasePath: '/',
        });
        const entry = buildSiteAiCatalog({ ...context, linker })?.entries[0];

        expect(entry?.identifier).toBe('urn:air:localhost:mcp:site_123');
        expect(entry?.identifier).toMatch(AIR_URN_PATTERN);
    });

    it('advertises nothing when the site publishes no MCP server', () => {
        expect(buildSiteAiCatalog(makeContext({ pageActions: [] }))).toBeNull();
    });
});

describe('serveSiteAiCatalog', () => {
    const catalogRequest = (init?: RequestInit) =>
        new Request('https://docs.acme.org/.well-known/ai-catalog.json', init);

    it('serves the catalog with its media type and CORS headers', async () => {
        const res = await serveSiteAiCatalog(makeContext(), catalogRequest());

        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toBe(`${AI_CATALOG_MEDIA_TYPE}; charset=utf-8`);
        expect(res.headers.get('access-control-allow-origin')).toBe('*');
        expect(res.headers.get('cache-control')).toBe('public, max-age=3600');

        const catalog = (await res.json()) as AiCatalog;
        expect(catalog.specVersion).toBe(AI_CATALOG_SPEC_VERSION);
        expect(catalog.entries).toHaveLength(1);
    });

    it('answers a preflight with a 204', async () => {
        const res = await serveSiteAiCatalog(makeContext(), catalogRequest({ method: 'OPTIONS' }));

        expect(res.status).toBe(204);
    });

    it('returns 304 when the client already has the current catalog', async () => {
        const context = makeContext();
        const first = await serveSiteAiCatalog(context, catalogRequest());
        const etag = first.headers.get('etag');

        const revalidated = await serveSiteAiCatalog(
            context,
            catalogRequest({ headers: { 'If-None-Match': `W/${etag}` } })
        );

        expect(revalidated.status).toBe(304);
    });

    it.each([SiteVisibility.ShareLink, SiteVisibility.VisitorAuth])(
        'never caches the catalog of a %s site',
        async (visibility) => {
            const res = await serveSiteAiCatalog(makeContext({ visibility }), catalogRequest());

            expect(res.headers.get('cache-control')).toBe('no-store');
        }
    );

    it('does not serve a catalog when there is nothing to advertise', async () => {
        const res = await serveSiteAiCatalog(makeContext({ pageActions: [] }), catalogRequest());

        expect(res.status).toBe(404);
    });
});
