let version = 1;
let assetsURL = '/public/icons/';

/**
 * Globally define the URL where assets are located.
 */
export function setAssetsURL(url: string) {
    assetsURL = url;
}

/**
 * Get the url of an asset.
 */
export function getAssetURL(path: string) {
    return assetsURL + (assetsURL.endsWith('/') ? '' : '/') + path + '?v=' + version;
}
