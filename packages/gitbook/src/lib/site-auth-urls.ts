/**
 * Resolve the URL to redirect a visitor to for an upstream auth flow (login or logout),
 * carrying the site-relative location the visitor should land on once the flow completes.
 *
 * Returns `null` when the site has no URL configured for the flow, or when it is not a
 * valid absolute URL, so callers can fall back to a chosen default URL.
 */
export function resolveUpstreamAuthURL(args: {
    siteAuthURL: string | undefined;
    location?: string | null;
}): string | null {
    const { siteAuthURL, location } = args;

    if (!siteAuthURL || !URL.canParse(siteAuthURL)) {
        return null;
    }

    const url = new URL(siteAuthURL);

    if (location) {
        url.searchParams.set('location', location);
    }

    return url.toString();
}
