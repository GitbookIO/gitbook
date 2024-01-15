/**
 * For a given GitBook URL, return a list of alternative URLs that could be matched against to lookup the content.
 * The approach is optimized to aim at reusing cached lookup results as much as possible.
 */
export function getURLLookupAlternatives(url: URL) {
    const alternatives: Array<{ url: string; extraPath: string }> = [];

    const pushAlternative = (url: URL, extraPath: string) => {
        const existing = alternatives.find((alt) => alt.url === url.toString());
        if (existing) {
            if (existing.extraPath !== extraPath) {
                throw new Error(
                    `Invalid extraPath ${extraPath} for url ${url.toString()}, already set to ${
                        existing.extraPath
                    }`,
                );
            }
            return;
        }

        alternatives.push({
            url: url.toString(),
            extraPath,
        });
    };

    const pathSegments = url.pathname.slice(1).split('/');

    // URL looks like a collection url (with /v/ in the path)
    // We only start matching after the /v/ segment and we ignore everything before it
    // to avoid potentially matching as a page not found under the default space in the collection
    if (pathSegments.includes('v')) {
        const collectionURL = new URL(url);
        const vIndex = pathSegments.indexOf('v');
        collectionURL.pathname = pathSegments.slice(0, vIndex + 2).join('/');

        pushAlternative(collectionURL, pathSegments.slice(vIndex + 2).join('/'));
    }

    // URL looks like a specific content url (with ~/revisions/ or ~/changes/ in the path)
    // We only start matching after the ~/revisions/ or ~/changes/ segment and we ignore everything before it
    else if (
        pathSegments.includes('~') &&
        (pathSegments.includes('revisions') || pathSegments.includes('changes'))
    ) {
        const contentURL = new URL(url);
        const tildeIndex = pathSegments.indexOf('~');
        const revisionIndex = pathSegments.indexOf('revisions');
        const changeIndex = pathSegments.indexOf('changes');
        const revisionOrChangeIndex = Math.max(revisionIndex, changeIndex);

        contentURL.pathname = pathSegments
            .slice(0, tildeIndex + revisionOrChangeIndex + 2)
            .join('/');

        pushAlternative(
            contentURL,
            pathSegments.slice(tildeIndex + revisionOrChangeIndex + 2).join('/'),
        );
    } else {
        // Match only with the host, if it can be a custom hostname
        // It should cover most cases of custom domains, and with caching, it should be fast.
        if (!url.hostname.includes('.gitbook.io')) {
            const noPathURL = new URL(url);
            noPathURL.pathname = '/';

            pushAlternative(noPathURL, url.pathname.slice(1));
        }

        // Otherwise match with only the first segment of the path
        // as it could potentially a space in an organization or collection domain
        // or a space using a share link secret
        if (pathSegments.length > 0) {
            const shortURL = new URL(url);
            shortURL.pathname = pathSegments[0];

            pushAlternative(shortURL, pathSegments.slice(1).join('/'));
        }
    }

    // Always try with the full URL
    if (!alternatives.some((alt) => alt.url === url.toString())) {
        pushAlternative(url, '');
    }

    return alternatives;
}
