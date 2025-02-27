import { CustomizationThemeMode } from '@gitbook/api';
import { headers } from 'next/headers';

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
     * The visitor token used for authentication.
     */
    VisitorToken = 'x-gitbook-visitor-token',

    /**
     * Token to use for the API.
     */
    APIToken = 'x-gitbook-token',

    /**
     * Endpoint to use for the API.
     */
    APIEndpoint = 'x-gitbook-api',
}

/**
 * Get the URL mode from the middleware headers.
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
 * For preview, the theme can be set via query string (?theme=light).
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
