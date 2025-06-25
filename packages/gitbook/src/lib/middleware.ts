import { CustomizationThemeMode } from '@gitbook/api';
import { headers } from 'next/headers';
import type { SiteURLData } from './context';

export enum MiddlewareHeaders {
    /**
     * Type of the route (static or dynamic)
     */
    RouteType = 'x-gitbook-route-type',

    /**
     * The URL of the site (without the pathname)
     */
    SiteURL = 'x-gitbook-site-url',

    /**
     * The data associated with the URL.
     */
    SiteURLData = 'x-gitbook-site-url-data',

    /**
     * The mode of the URL (url or url-host)
     */
    URLMode = 'x-gitbook-url-mode',

    /**
     * The theme of the page (light or dark)
     */
    Theme = 'x-gitbook-theme',

    /**
     * The customization override to apply.
     */
    Customization = 'x-gitbook-customization',

    /**
     * The API token used to fetch the content.
     * This should only be passed for non-site dynamic routes.
     */
    APIToken = 'x-gitbook-api-token',
}

/**
 * Get the URL mode from the middleware headers.
 * This function should only be called in a server action or a dynamic route.
 */
export async function getURLModeFromMiddleware(): Promise<'url' | 'url-host'> {
    const headersList = await headers();
    const mode = headersList.get(MiddlewareHeaders.URLMode);
    if (!mode) {
        throw new Error('URL mode is not set by the middleware');
    }

    return mode as 'url' | 'url-host';
}

/**
 * Get the site URL data from the middleware headers.
 * This function should only be called in a server action or a dynamic route.
 */
export async function getSiteURLDataFromMiddleware(): Promise<SiteURLData> {
    const headersList = await headers();
    const siteURLData = headersList.get(MiddlewareHeaders.SiteURLData);

    if (!siteURLData) {
        throw new Error(
            'Site URL data is not set by the middleware. This should only be called in a server action or a dynamic route.'
        );
    }

    return JSON.parse(siteURLData);
}

/**
 * Get the URL from the middleware headers.
 * This function should only be called in a server action or a dynamic route.
 */
export async function getSiteURLFromMiddleware(): Promise<string> {
    const headersList = await headers();
    const siteURL = headersList.get(MiddlewareHeaders.SiteURL);
    if (!siteURL) {
        throw new Error('URL mode is not set by the middleware');
    }

    return siteURL;
}

/**
 * For preview, the theme can be set via query string (?theme=light).
 * This function should only be called in a dynamic route.
 */
export async function getThemeFromMiddleware() {
    const headersList = await headers();
    const queryStringTheme = headersList.get(MiddlewareHeaders.Theme);
    if (!queryStringTheme) {
        return null;
    }

    return queryStringTheme === 'light'
        ? CustomizationThemeMode.Light
        : CustomizationThemeMode.Dark;
}

/**
 * Get the API token from the middleware headers.
 * This function should only be called in a dynamic route.
 */
export async function getAPITokenFromMiddleware(): Promise<string> {
    const headersList = await headers();
    const apiToken = headersList.get(MiddlewareHeaders.APIToken);
    if (!apiToken) {
        throw new Error('API token is not set by the middleware');
    }

    return apiToken;
}
