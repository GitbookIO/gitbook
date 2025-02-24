import { CustomizationThemeMode } from '@gitbook/api';
import { headers } from 'next/headers';

enum MiddlewareHeaders {
    Theme = 'x-gitbook-theme',
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
