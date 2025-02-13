import { LoadPlugin } from '@scalar/openapi-parser';

export const fetchUrlsDefaultConfiguration = {
    limit: 40,
};

export const fetchUrls: (customConfiguration: {
    /**
     * Base URL to use for relative paths.
     */
    baseUrl: string;

    /**
     * Limit the number of requests. Set to `false` to disable the limit.
     */
    limit?: number | false;
}) => LoadPlugin = (customConfiguration) => {
    // State
    let numberOfRequests = 0;

    // Configuration
    const configuration = {
        ...fetchUrlsDefaultConfiguration,
        ...customConfiguration,
    };

    return {
        check(value?: any) {
            // Not a string
            if (typeof value !== 'string') {
                return false;
            }

            // Not http/https or relative path
            if (
                !value.startsWith('http://') &&
                !value.startsWith('https://') &&
                !isRelativePath(value)
            ) {
                return false;
            }

            return true;
        },
        async get(value?: any) {
            // Limit ht enumber of requests
            if (configuration?.limit !== false && numberOfRequests >= configuration?.limit) {
                console.warn(
                    `[fetchUrls] Maximum number of requests reeached (${configuration?.limit}), skipping request`,
                );
                return undefined;
            }

            try {
                numberOfRequests++;
                const url = getReferenceUrl(value, configuration.baseUrl);
                const response = await fetch(url);
                return await response.text();
            } catch (error: any) {
                console.error('[fetchUrls]', error.message, `(${value})`);
                return undefined;
            }
        },
    };
};

/**
 * Check if a path is relative.
 */
function isRelativePath(path: string): boolean {
    // Exclude external URLs
    const externalUrlPattern = /^(https?:\/\/|www\.|data:|#\/)/;
    return !externalUrlPattern.test(path);
}

/**
 * Get the reference URL.
 */
function getReferenceUrl(value: string, baseUrl: string) {
    if (isRelativePath(value)) {
        return new URL(value, baseUrl).href;
    }

    return value;
}
