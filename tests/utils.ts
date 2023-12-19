/**
 * Get the target URL from the command line arguments.
 */
export function getTargetURL() {
    const targetUrl = Bun.argv[2];
    if (!targetUrl) {
        console.error('No target URL provided');
        process.exit(1);
    }

    return targetUrl;
}

/**
 * Get the URL to load for a content
 */
export function getContentTestURL(input: string): string {
    const url = new URL(getTargetURL());
    const contentUrl = new URL(input);

    url.pathname = `${contentUrl.host}${contentUrl.pathname}`;
    url.search = contentUrl.search;

    return url.toString();
}
