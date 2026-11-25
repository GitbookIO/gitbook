import { createHighlight } from './highlighter';
import { joinPathWithBaseURL } from '@/lib/paths';

const highlighters = new Map<string, ReturnType<typeof createHighlight>>();

/**
 * Highlighting functions for the browser, loading Shiki assets from the static assets URL.
 * The URL comes from the server because the client build doesn't know the runtime assets host.
 */
export function getClientHighlight(staticAssetsURL: string) {
    let highlighter = highlighters.get(staticAssetsURL);
    if (!highlighter) {
        highlighter = createHighlight(async (path) => {
            const response = await fetch(joinPathWithBaseURL(staticAssetsURL, path));
            if (!response.ok) {
                throw new Error(`Failed to fetch ${path}: ${response.status}`);
            }
            return response.json();
        });
        highlighters.set(staticAssetsURL, highlighter);
    }
    return highlighter;
}
