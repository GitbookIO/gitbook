import { Client } from '@modelcontextprotocol/sdk/client';
import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type {
    OAuthClientInformation,
    OAuthClientInformationFull,
    OAuthClientMetadata,
    OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import type { FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';

import { getContentTestURL } from './utils';

/**
 * Client ID returned by the stubbed registration endpoint.
 */
export const STUBBED_OAUTH_CLIENT_ID = 'gitbook-open-tests-client-id';

/**
 * Redirect URI the test client registers. Nothing ever listens on it: the flow is asserted at the
 * point where a real client would open a browser, so the authorization code never comes back.
 */
const TEST_REDIRECT_URI = 'http://localhost:9999/callback';

/**
 * Everything an MCP client observes while discovering how to authenticate against a site, recorded
 * so tests can assert on each document of the chain.
 */
export type RecordedOAuthDiscovery = {
    /** `WWW-Authenticate` header of the 401 challenge that started the flow. */
    challenge?: string;
    /** `resource_metadata` URL advertised by the challenge. */
    resourceMetadataURL?: string;
    /** Protected Resource Metadata document, RFC 9728. */
    protectedResourceMetadata?: Record<string, unknown>;
    /** Authorization Server Metadata document, RFC 8414. */
    authorizationServerMetadata?: Record<string, unknown>;
    /** Endpoint the client posted its registration to. */
    registrationURL?: string;
    /** Client ID the client ended up using. */
    clientId?: string;
    /** Authorization URL the client would have opened in the visitor's browser. */
    authorizationURL?: URL;
};

/**
 * An MCP client playing the OAuth client role without a browser.
 *
 * It walks the real discovery chain — 401 challenge, protected resource metadata, authorization
 * server metadata — recording each document, and stops where a real client would hand the visitor
 * over to their browser to log in and consent.
 *
 * Dynamic client registration is stubbed: what GitBook Open owns is advertising the endpoint, while
 * the registration itself and the rest of the flow belong to the OAuth server and are covered by
 * its own tests. Registering for real would also create a client record on every run.
 */
export class McpOAuthTestClient implements OAuthClientProvider {
    readonly redirectUrl = TEST_REDIRECT_URI;
    readonly discovery: RecordedOAuthDiscovery = {};

    private clientInformationFull: OAuthClientInformationFull | undefined;
    private savedCodeVerifier: string | undefined;

    /**
     * Connect to an MCP endpoint. On a protected endpoint this rejects with `UnauthorizedError`
     * once the discovery chain has been walked and recorded.
     */
    async connect(url: string) {
        const client = new Client({ name: 'gitbook-open-tests', version: '1.0.0' });
        await client.connect(
            new StreamableHTTPClientTransport(new URL(url), {
                authProvider: this,
                fetch: this.fetchAndRecord,
            })
        );
        return client;
    }

    get clientMetadata(): OAuthClientMetadata {
        return {
            client_name: 'gitbook-open-tests',
            redirect_uris: [TEST_REDIRECT_URI],
            grant_types: ['authorization_code', 'refresh_token'],
            response_types: ['code'],
            token_endpoint_auth_method: 'none',
        };
    }

    /** Returning nothing on the first call is what sends the SDK down the registration path. */
    clientInformation(): OAuthClientInformation | undefined {
        return this.clientInformationFull;
    }

    saveClientInformation(clientInformation: OAuthClientInformationFull) {
        this.clientInformationFull = clientInformation;
        this.discovery.clientId = clientInformation.client_id;
    }

    /** No token and no refresh token, so the SDK always starts a fresh authorization. */
    tokens(): OAuthTokens | undefined {
        return undefined;
    }

    saveTokens() {}

    saveCodeVerifier(codeVerifier: string) {
        this.savedCodeVerifier = codeVerifier;
    }

    codeVerifier() {
        if (!this.savedCodeVerifier) {
            throw new Error('No code verifier saved');
        }
        return this.savedCodeVerifier;
    }

    /** Where a real client opens a browser. */
    redirectToAuthorization(authorizationUrl: URL) {
        this.discovery.authorizationURL = authorizationUrl;
    }

    /**
     * Fetch used for every request the client makes, recording the discovery documents on the way
     * through and standing in for the authorization server's registration endpoint.
     */
    private readonly fetchAndRecord: FetchLike = async (input, init) => {
        const url = new URL(input.toString());

        const registrationEndpoint =
            this.discovery.authorizationServerMetadata?.registration_endpoint;
        if (registrationEndpoint && url.href === registrationEndpoint) {
            this.discovery.registrationURL = url.href;
            return Response.json({
                ...JSON.parse(String(init?.body)),
                client_id: STUBBED_OAUTH_CLIENT_ID,
            });
        }

        const response = await fetch(input, init);

        const challenge = response.headers.get('WWW-Authenticate');
        if (response.status === 401 && challenge) {
            this.discovery.challenge = challenge;
            this.discovery.resourceMetadataURL = challenge.match(
                /resource_metadata="([^"]*)"/
            )?.[1];
        }

        if (response.ok && url.pathname.includes('/.well-known/')) {
            const document = (await response.clone().json()) as Record<string, unknown>;
            if (url.pathname.includes('/.well-known/oauth-protected-resource')) {
                this.discovery.protectedResourceMetadata = document;
            } else if (!this.discovery.authorizationServerMetadata) {
                // The SDK tries several well-known locations and uses the first that answers.
                this.discovery.authorizationServerMetadata = document;
            }
        }

        return response;
    };
}

/**
 * Connect an MCP client to an endpoint, optionally presenting a visitor token as the OAuth bearer
 * token — which is what an MCP client does once it holds an access token.
 */
export async function connectMCPClient(url: string, options: { token?: string } = {}) {
    const client = new Client({ name: 'test', version: '1.0.0' });
    await client.connect(
        new StreamableHTTPClientTransport(new URL(url), {
            ...(options.token
                ? { requestInit: { headers: { Authorization: `Bearer ${options.token}` } } }
                : {}),
        })
    );
    return client;
}

/**
 * Fetch the OAuth 2.0 Protected Resource Metadata (RFC 9728) document for an MCP endpoint.
 */
export async function fetchProtectedResourceMetadata(siteURL: string, endpoint: string) {
    const response = await fetch(
        getContentTestURL(`${siteURL}/.well-known/oauth-protected-resource/${endpoint}`)
    );
    return {
        status: response.status,
        body: response.ok ? ((await response.json()) as Record<string, unknown>) : undefined,
    };
}
