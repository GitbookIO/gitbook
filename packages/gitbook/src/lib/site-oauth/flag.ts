/**
 * Whether GBO should render the sites OAuth consent screen (instead of forwarding the post-login
 * resume to the OAuth server). Mirrors the OAuth server's own flag: an explicit env override
 * decides, otherwise consent is enabled everywhere but production. This must be coordinated with the
 * OAuth server so GBO renders consent exactly when the server expects it.
 *
 * Kept in its own module (free of `node:crypto`/`server-only`) so it can be imported from the edge
 * middleware. It is never imported into a client bundle.
 */
export function isSitesOAuthConsentEnabled(): boolean {
    const override = process.env.GITBOOK_SITE_OAUTH_CONSENT_ENABLED;
    if (override !== undefined) {
        return override === 'true';
    }
    return process.env.NODE_ENV !== 'production';
}

/**
 * Interaction id the OAuth server puts on the post-login resume URL. Its presence marks a resume
 * that GBO should render consent for (rather than forward to the OAuth server).
 */
export const SITE_OAUTH_STATE_PARAM = 'gb_oauth_state';

/**
 * Whether GBO should render the consent screen for a request hitting the
 * `~gitbook/oauth2/v1/:siteId/authorize` forwarder, rather than forwarding it to the OAuth server.
 *
 * Render only when consent is enabled AND this is a post-login resume (carries the interaction id);
 * everything else forwards, preserving the legacy behavior.
 */
export function shouldRenderSiteOAuthConsent(searchParams: URLSearchParams): boolean {
    return isSitesOAuthConsentEnabled() && searchParams.has(SITE_OAUTH_STATE_PARAM);
}
