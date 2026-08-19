// Built as standalone assets by `scripts/generate-block-css.ts` rather than imported: an import
// would put them in the route's render-blocking CSS on every page, block or no block.
// Values are the sources to compile, relative to `src/`.
export const BLOCK_STYLESHEETS = {
    openapi: 'components/DocumentView/OpenAPI/style.css',
    contentkit: 'components/DocumentView/Integration/contentkit.css',
} as const;

export type BlockStylesheetName = keyof typeof BLOCK_STYLESHEETS;
