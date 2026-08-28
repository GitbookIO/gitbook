import { UnauthorizedError } from '@modelcontextprotocol/sdk/client/auth.js';
import { describe, expect, it } from 'bun:test';
import jwt from 'jsonwebtoken';

import {
    McpOAuthTestClient,
    STUBBED_OAUTH_CLIENT_ID,
    connectMCPClient,
    fetchProtectedResourceMetadata,
} from './mcp-utils';
import { getContentTestURL } from './utils';


it(
    'should expose a MCP server',
    async () => {
        const client = await connectMCPClient(
            getContentTestURL('https://gitbook.com/docs/~gitbook/mcp')
        );

        const tools = await client.listTools();
        expect(tools.tools[0]?.name).toBe('searchDocumentation');

        const response = await client.callTool({
            name: 'searchDocumentation',
            arguments: {
                query: 'git',
            },
        });

        // @ts-expect-error - response.content is of type unknown
        expect(response.content[0]?.text).toContain('Title:');
    },
    { timeout: 10_000 }
);

it(
    'should get a page from another site space through MCP',
    async () => {
        const client = await connectMCPClient(
            getContentTestURL(
                'https://gitbook-open-e2e-sites.gitbook.io/api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/~gitbook/mcp/auth'
            )
        );

        const response = await client.callTool({
            name: 'getPage',
            arguments: {
                url: 'https://gitbook-open-e2e-sites.gitbook.io/api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/3.0/other-page',
            },
        });

        // @ts-expect-error - response.content is of type unknown
        expect(response.content[0]?.text).toContain('# Other Page');
    },
    { timeout: 15_000 }
);

describe('MCP on a site behind visitor authentication', () => {
    const VA_SITE_URL = 'https://gitbook-open-e2e-sites.gitbook.io/va-site-redirects-fallback';

    // Both endpoints are protected on a VA site: there is no public content to serve.
    const protectedEndpoints = ['~gitbook/mcp', '~gitbook/mcp/auth'];

    it.each(protectedEndpoints)(
        'should challenge unauthenticated requests to %s with a pointer to the PRM document',
        async (endpoint) => {
            const response = await fetch(getContentTestURL(`${VA_SITE_URL}/${endpoint}`));

            expect(response.status).toBe(401);
            expect(response.headers.get('WWW-Authenticate')).toMatch(
                new RegExp(
                    `^Bearer realm="mcp", resource_metadata="https?://.+/\\.well-known/oauth-protected-resource/${endpoint}"$`
                )
            );
        },
        15_000
    );

    it.each(protectedEndpoints)(
        'should serve protected resource metadata for %s',
        async (endpoint) => {
            const { status, body } = await fetchProtectedResourceMetadata(VA_SITE_URL, endpoint);

            expect(status).toBe(200);
            expect(body?.resource).toMatch(new RegExp(`/${endpoint}$`));
            // The authorization server is the site's own OAuth server, which is what the client
            // resolves the registration and authorization endpoints from.
            expect(body?.authorization_servers).toEqual([
                expect.stringMatching(/\/oauth2\/v1\/site_[\w-]+$/),
            ]);
        },
        15_000
    );

    it(
        'should reject an MCP client that connects without a token',
        async () => {
            // A client without OAuth support just sees the 401; the transport surfaces it either
            // from the POST or from the SSE stream, so we only assert on the message.
            await expect(
                connectMCPClient(getContentTestURL(`${VA_SITE_URL}/~gitbook/mcp`))
            ).rejects.toThrow(/Unauthorized/);
        },
        { timeout: 15_000 }
    );

    describe('OAuth discovery by an MCP client', () => {
        const client = new McpOAuthTestClient();
        let connecting: Promise<void> | undefined;

        /**
         * Walk the discovery chain once and share the recording across the assertions below. The
         * client gives up with an `UnauthorizedError` because completing the flow requires the
         * visitor to log in and consent in a browser.
         */
        async function discover() {
            connecting ??= (async () => {
                await expect(
                    client.connect(getContentTestURL(`${VA_SITE_URL}/~gitbook/mcp`))
                ).rejects.toThrow(UnauthorizedError);
            })();
            await connecting;
            return client.discovery;
        }

        it(
            'should point the client at the protected resource metadata',
            async () => {
                const { challenge, resourceMetadataURL } = await discover();

                expect(challenge).toStartWith('Bearer realm="mcp", ');
                expect(resourceMetadataURL).toMatch(
                    /\/\.well-known\/oauth-protected-resource\/~gitbook\/mcp$/
                );
            },
            { timeout: 30_000 }
        );

        it(
            'should describe the resource and its authorization server',
            async () => {
                const { protectedResourceMetadata } = await discover();

                expect(protectedResourceMetadata?.resource).toMatch(/\/~gitbook\/mcp$/);
                expect(protectedResourceMetadata?.authorization_servers).toEqual([
                    expect.stringMatching(/\/oauth2\/v1\/site_[\w-]+$/),
                ]);
            },
            { timeout: 30_000 }
        );

        it(
            'should lead to an authorization server supporting registration and PKCE',
            async () => {
                const { protectedResourceMetadata, authorizationServerMetadata } = await discover();

                expect(authorizationServerMetadata?.issuer).toBe(
                    (protectedResourceMetadata?.authorization_servers as string[])[0]!
                );
                expect(authorizationServerMetadata?.registration_endpoint).toMatch(
                    /\/oauth2\/v1\/site_[\w-]+\/register$/
                );
                expect(authorizationServerMetadata?.code_challenge_methods_supported).toContain(
                    'S256'
                );
            },
            { timeout: 30_000 }
        );

        it(
            'should register itself against the advertised registration endpoint',
            async () => {
                const { registrationURL, authorizationServerMetadata, clientId } = await discover();

                expect(registrationURL).toBe(
                    authorizationServerMetadata?.registration_endpoint as string
                );
                expect(clientId).toBe(STUBBED_OAUTH_CLIENT_ID);
            },
            { timeout: 30_000 }
        );

        it(
            'should build an authorization URL for the registered client',
            async () => {
                const { authorizationURL, authorizationServerMetadata, protectedResourceMetadata } =
                    await discover();

                expect(authorizationURL?.href).toStartWith(
                    authorizationServerMetadata?.authorization_endpoint as string
                );
                expect(authorizationURL?.searchParams.get('response_type')).toBe('code');
                expect(authorizationURL?.searchParams.get('client_id')).toBe(
                    STUBBED_OAUTH_CLIENT_ID
                );
                expect(authorizationURL?.searchParams.get('code_challenge_method')).toBe('S256');
                // RFC 8707 resource indicator, naming the MCP endpoint the token is meant for.
                expect(authorizationURL?.searchParams.get('resource')).toBe(
                    protectedResourceMetadata?.resource as string
                );
            },
            { timeout: 30_000 }
        );
    });
});

/**
 * A public site serving adaptive content through a custom backend: `~gitbook/mcp` is open to
 * everyone, while `~gitbook/mcp/auth` opts into the visitor-specific content.
 */
describe('MCP on a public site with adaptive content', () => {
    it(
        'should let an MCP client connect to ~gitbook/mcp without authenticating',
        async () => {
            const client = await connectMCPClient(
                getContentTestURL(
                    'https://gitbook-open-e2e-sites.gitbook.io/adaptive-content-public/~gitbook/mcp'
                )
            );

            const tools = await client.listTools();
            expect(tools.tools.map((tool) => tool.name)).toContain('searchDocumentation');
        },
        { timeout: 15_000 }
    );

    it(
        'should not advertise protected resource metadata for the public ~gitbook/mcp endpoint',
        async () => {
            // Advertising a PRM document for an endpoint that never challenges would send clients
            // doing proactive discovery into an OAuth flow they don't need.
            const { status } = await fetchProtectedResourceMetadata(
                'https://gitbook-open-e2e-sites.gitbook.io/adaptive-content-public',
                '~gitbook/mcp'
            );

            expect(status).toBe(404);
        },
        { timeout: 15_000 }
    );

    it(
        'should advertise protected resource metadata for the ~gitbook/mcp/auth endpoint',
        async () => {
            const { status, body } = await fetchProtectedResourceMetadata(
                'https://gitbook-open-e2e-sites.gitbook.io/adaptive-content-public',
                '~gitbook/mcp/auth'
            );

            expect(status).toBe(200);
            expect(body?.resource).toMatch(/\/~gitbook\/mcp\/auth$/);
            expect(body?.authorization_servers).toEqual([
                expect.stringMatching(/\/oauth2\/v1\/site_[\w-]+$/),
            ]);
        },
        { timeout: 15_000 }
    );

    it(
        'should serve the visitor-specific content once the client presents a token',
        async () => {
            // The anonymous half goes through the public endpoint: `~gitbook/mcp/auth` now
            // challenges unauthenticated clients, so there is no anonymous session to compare with.
            const anonymousClient = await connectMCPClient(
                getContentTestURL(
                    'https://gitbook-open-e2e-sites.gitbook.io/adaptive-content-public/~gitbook/mcp'
                )
            );
            const anonymousResponse = await anonymousClient.callTool({
                name: 'getPage',
                arguments: {
                    url: 'https://gitbook-open-e2e-sites.gitbook.io/adaptive-content-public/alpha-user',
                },
            });
            expect(anonymousResponse.isError).toBe(true);

            const alphaClient = await connectMCPClient(
                getContentTestURL(
                    'https://gitbook-open-e2e-sites.gitbook.io/adaptive-content-public/~gitbook/mcp/auth'
                ),
                {
                    // The token an adaptive content backend would issue for this visitor.
                    token: jwt.sign(
                        { name: 'gitbook-open-tests', isAlphaUser: true },
                        '4ddd3c2f-e4b7-4e73-840b-526c3be19746',
                        { expiresIn: '1h' }
                    ),
                }
            );
            const alphaResponse = await alphaClient.callTool({
                name: 'getPage',
                arguments: {
                    url: 'https://gitbook-open-e2e-sites.gitbook.io/adaptive-content-public/alpha-user',
                },
            });
            // @ts-expect-error - response.content is of type unknown
            expect(alphaResponse.content[0]?.text).toContain('# Alpha User');
        },
        { timeout: 30_000 }
    );
});
