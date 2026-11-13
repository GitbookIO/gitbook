/**
 * Constants shared between the preview comments routes (server) and the commenting UI (client).
 */

/**
 * Channel the OAuth callback page broadcasts on once the user is signed in.
 * A BroadcastChannel is used on top of `window.opener` because the GitBook app may set
 * `Cross-Origin-Opener-Policy`, which severs the opener reference of the popup.
 */
export const PREVIEW_COMMENTS_AUTH_CHANNEL = 'gitbook-preview-comments-auth';

/**
 * Path (relative to the site base path) of the route starting the sign-in flow.
 */
export const PREVIEW_COMMENTS_LOGIN_PATH = '~gitbook/comments/login';

/**
 * Path (relative to the site base path) of the OAuth redirect URI.
 */
export const PREVIEW_COMMENTS_CALLBACK_PATH = '~gitbook/comments/callback';
