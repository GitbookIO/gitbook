import { LoadPlugin } from '@scalar/openapi-parser';

export const fetchUrlsDefaultConfiguration = {
    limit: 40,
};

export const fetchUrls: (customConfiguration?: {
    /**
     * Limit the number of requests. Set to `false` to disable the limit.
     */
    limit?: number | false;
    /**
     * Fetch function to use instead of the global fetch. Use this to intercept requests.
     */
    fetch?: (url: string) => Promise<Response>;

    prefix?: string;
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

                const url = getReferenceUrl(value, configuration?.prefix);

                const response = await (configuration?.fetch
                    ? configuration.fetch(url)
                    : fetch(url));

                return await response.text();
            } catch (error: any) {
                console.error('[fetchUrls]', error.message, `(${value})`);
            }
        },
    };
};

function isRelativePath(value: string) {
    return value.startsWith('/') || value.startsWith('./') || value.startsWith('../');
}

function getReferenceUrl(value: string, prefix?: string) {
    if (isRelativePath(value)) {
        return `${prefix}/${value}`;
    }

    return value;
}
