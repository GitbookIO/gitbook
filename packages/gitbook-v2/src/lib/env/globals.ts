import 'server-only';

/*
 * Support both Cloudflare and Vercel, environment variables can be bundled.
 * To avoid leaking them on the client-side, they should be accessed from this file
 * and not from the `process.env` object.
 */

/**
 * Main host on which GitBook is running.
 */
export const GITBOOK_URL =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : (process.env.GITBOOK_URL ??
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
          '');

/**
 * URL at which static assets are served.
 */
export const GITBOOK_ASSETS_URL =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : process.env.GITBOOK_ASSETS_PREFIX;

/**
 * GitBook app URL.
 */
export const GITBOOK_APP_URL = process.env.GITBOOK_APP_URL || 'https://app.gitbook.com';

/**
 * Default GitBook API URL endpoint.
 */
export const GITBOOK_API_URL = process.env.GITBOOK_API_URL || 'https://api.gitbook.com';

/**
 * Default GitBook API URL endpoint, to be shared with the client.
 */
export const GITBOOK_API_PUBLIC_URL = process.env.GITBOOK_API_PUBLIC_URL || GITBOOK_API_URL;

/**
 * Default GitBook API token.
 * It can be use to avoid rate-limiting.
 */
export const GITBOOK_API_TOKEN = process.env.GITBOOK_API_TOKEN || null;

/**
 * User agent to use for API requests.
 */
export const GITBOOK_USER_AGENT = process.env.GITBOOK_USER_AGENT || 'GitBook-Open/2.0.0';

/**
 * Whether to disable tracking of events into site insights.
 * This is used to disable tracking in development mode.
 */
export const GITBOOK_DISABLE_TRACKING = Boolean(
    !!process.env.GITBOOK_DISABLE_TRACKING || process.env.NODE_ENV !== 'production'
);

/**
 * Hostname serving the integrations.
 */
export const GITBOOK_INTEGRATIONS_HOST =
    process.env.GITBOOK_INTEGRATIONS_HOST || 'integrations.gitbook.com';

/**
 * Hostname for fonts.
 */
export const GITBOOK_FONTS_URL = process.env.GITBOOK_FONTS_URL || 'https://fonts.gitbook.com';

/**
 * Endpoint to use for resizing images.
 * It should be a Cloudflare domain with image resizing enabled.
 */
export const GITBOOK_IMAGE_RESIZE_URL = process.env.GITBOOK_IMAGE_RESIZE_URL ?? null;
export const GITBOOK_IMAGE_RESIZE_SIGNING_KEY =
    process.env.GITBOOK_IMAGE_RESIZE_SIGNING_KEY ?? null;

/**
 * Endpoint where icons are served.
 */
export const GITBOOK_ICONS_URL =
    process.env.GITBOOK_ICONS_URL || `${GITBOOK_ASSETS_URL || ''}/~gitbook/static/icons`;

/**
 * Token passed to the icons endpoint.
 */
export const GITBOOK_ICONS_TOKEN = process.env.GITBOOK_ICONS_TOKEN;

/**
 * Secret used to validate requests from the GitBook app.
 */
export const GITBOOK_SECRET = process.env.GITBOOK_SECRET ?? null;
