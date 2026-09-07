import { getURLLookupAlternatives, stripURLSearch } from './urls';

/**
 * Build the lookup candidates, using a trusted PPR lookup URL as the only candidate.
 */
export function getPublishedContentLookupPlan(input: { url: string; urlLookup?: string }) {
    if (input.urlLookup) {
        return {
            urls: [{ url: input.urlLookup, primary: true, extraPath: '' }],
            basePath: undefined,
            changeRequest: undefined,
            revision: undefined,
            direct: true,
        };
    }

    const lookupURL = new URL(input.url);
    const url = stripURLSearch(lookupURL);
    return { ...getURLLookupAlternatives(url), direct: false };
}
