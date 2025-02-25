import { CustomizationThemeMode } from '@gitbook/api';
import { headers } from 'next/headers';

export enum MiddlewareHeaders {
    URL = 'x-gitbook-url',
    URLMode = 'x-gitbook-url-mode',
    Theme = 'x-gitbook-theme',
}

/**
 * Get the URL from the middleware headers.
 */
export async function getURLFromMiddleware() {
    const headersList = await headers();
    const url = headersList.get(MiddlewareHeaders.URL);
    if (!url) {
        throw new Error('URL is not set by the middleware');
    }

    return url;
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
