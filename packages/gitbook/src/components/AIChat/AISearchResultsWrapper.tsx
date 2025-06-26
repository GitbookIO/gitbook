import { AISearchResults } from './AISearchResults';

/**
 * This component is used to force the inclusion of client components
 * in the React Client Manifest when they are only used in server actions.
 * See: https://github.com/vercel/next.js/issues/58125#issuecomment-2791272922
 */
export function UseForceImportOfClientComponentTree() {
    // This ensures AISearchResults and its dependencies are included in the client manifest
    // The import above is enough to include it in the bundle, but we also reference it here
    // to prevent tree-shaking from removing it
    const _forceInclude = AISearchResults;
    return null;
}
