/**
 * Cache-busting version for the static icon SVG assets served by GitBook.
 *
 * This value must be shared by both the client-side icon renderer and any
 * server-side code that fetches or inlines icon SVGs, otherwise the browser can
 * receive different cache keys for the same icon asset.
 */
export const GITBOOK_ICONS_ASSET_VERSION = '2';
