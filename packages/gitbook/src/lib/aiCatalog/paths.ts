/**
 * Internal route the catalog is served from, which the well-known path rewrites to.
 */
export const AI_CATALOG_PATH = '~gitbook/ai-catalog';

/**
 * Where domain-level discovery looks. Unlike a server card, a catalog *is* site-wide metadata, so
 * `.well-known` is the spec's own home for it rather than a concession to scanners.
 */
export const AI_CATALOG_WELL_KNOWN_PATH = '.well-known/ai-catalog.json';
