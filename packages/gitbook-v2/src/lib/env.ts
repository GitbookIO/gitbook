/**
 * Main host on which GitBook is running.
 */
export const GITBOOK_URL =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : ((process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
          process.env.GITBOOK_URL ??
          '');

/**
 * GitBook app URL.
 */
export const GITBOOK_APP_URL = process.env.NEXT_PUBLIC_GITBOOK_APP_URL ?? `https://app.gitbook.com`;

/**
 * Default GitBook API URL endpoint.
 */
export const GITBOOK_API_URL = process.env.GITBOOK_API_URL ?? 'https://api.gitbook.com';

/**
 * Default GitBook API token.
 * It can be use to avoid rate-limiting.
 */
export const GITBOOK_API_TOKEN = process.env.GITBOOK_API_TOKEN ?? null;

/**
 * User agent to use for API requests.
 */
export const GITBOOK_USER_AGENT = process.env.GITBOOK_USER_AGENT ?? 'GitBook-Open/2.0.0';

/**
 * Whether to disable tracking of events into site insights.
 * This is used to disable tracking in development mode.
 */
export const GITBOOK_DISABLE_TRACKING = Boolean(
    !!process.env.GITBOOK_DISABLE_TRACKING || process.env.NODE_ENV !== 'production',
);
