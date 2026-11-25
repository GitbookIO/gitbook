import { createHighlight } from './highlighter';
import { loadShikiAssetOnServer } from './shiki-assets.server';

export * from './highlight-tokens';
export { getLanguageForSyntax } from './highlighter';

export const { highlight, preloadHighlight } = createHighlight(loadShikiAssetOnServer);
