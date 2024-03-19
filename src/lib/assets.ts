let assetsDomain = '';
if (process.env.GITBOOK_ASSETS_PREFIX) {
    const parsed = new URL(process.env.GITBOOK_ASSETS_PREFIX);
    assetsDomain = `${parsed.protocol}//${parsed.host}`;
}

/**
 * Create a public URL for an asset.
 */
export function getStaticFileURL(path: string): string {
    return `${assetsDomain}/~gitbook/static/${path}`;
}

export { assetsDomain };
