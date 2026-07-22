/**
 * Query param on the post-login resume URL carrying the OAuth server's *signed* consent marker
 * (`?gb_oauth_state=<interactionId>&gb_consent=<signature>`). The signature proves the OAuth server
 * has consent enabled for this authorization; GBO verifies it before rendering the consent screen so
 * a visitor can't forge the flag on the resume URL. When it's absent or fails verification, GBO
 * forwards the resume to the OAuth server exactly as in the legacy path.
 *
 * Kept in its own module (free of `node:crypto`/`server-only`, verifying with async Web Crypto) so
 * it can be imported and awaited from the edge middleware. It is never imported into a client bundle.
 */
export const SITE_OAUTH_CONSENT_PARAM = 'gb_consent';

/**
 * Interaction id the OAuth server puts on the post-login resume URL. It is part of the signed
 * consent marker and is passed to the consent endpoints to identify the pending authorization.
 */
export const SITE_OAUTH_STATE_PARAM = 'gb_oauth_state';

const encoder = new TextEncoder();

/**
 * Whether GBO should render the consent screen for a request hitting the
 * `~gitbook/oauth2/v1/:siteId/authorize` forwarder, rather than forwarding it to the OAuth server.
 *
 * The OAuth server signals this per request via the signed consent marker; GBO verifies it against
 * the site and interaction, making the OAuth server the single source of truth for whether consent
 * is enabled. Without a valid marker, GBO forwards (legacy).
 */
export function shouldRenderSiteOAuthConsent(
    siteId: string | undefined,
    searchParams: URLSearchParams
): Promise<boolean> {
    return verifySiteOAuthConsentMarker({
        siteId,
        interactionId: searchParams.get(SITE_OAUTH_STATE_PARAM),
        signature: searchParams.get(SITE_OAUTH_CONSENT_PARAM),
    });
}

/**
 * Verify the OAuth server's signed consent marker. The marker is the hex HMAC-SHA256 of
 * `consent-enabled:<siteId>:<interactionId>` keyed with the shared sites-OAuth signing secret (the
 * same secret used to sign the server-to-server consent requests). Returns true only when the
 * signature matches, using a constant-time comparison.
 */
export async function verifySiteOAuthConsentMarker(args: {
    siteId: string | undefined;
    interactionId: string | null | undefined;
    signature: string | null | undefined;
}): Promise<boolean> {
    const { siteId, interactionId, signature } = args;
    const secret = process.env.GITBOOK_SITE_OAUTH_SIGNING_SECRET;
    if (!secret || !siteId || !interactionId || !signature) {
        return false;
    }

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const digest = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(`consent-enabled:${siteId}:${interactionId}`)
    );

    return timingSafeEqualHex(bufferToHex(digest), signature);
}

function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Constant-time comparison of two hex signatures of equal length (the HMAC-SHA256 hex is always 64
 * chars, so the length check doesn't leak anything sensitive).
 */
function timingSafeEqualHex(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }
    let mismatch = 0;
    for (let index = 0; index < a.length; index++) {
        mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
    }
    return mismatch === 0;
}
