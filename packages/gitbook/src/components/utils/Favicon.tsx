import type React from 'react';

type FaviconProps = React.ComponentPropsWithoutRef<'img'> & {
    /**
     * The URL of the website to get the favicon from. It can be a page URL, it doesn't have to be the root domain.
     */
    url: string;

    /**
     * Fallback to render if the favicon cannot be loaded.
     */
    fallback?: React.ReactNode;
};

/**
 * Render the favicon of a website.
 */
export function Favicon({ url, fallback, ...props }: FaviconProps) {
    const domain = getDomain(url);
    const faviconURL = domain ? getFaviconURL(domain) : null;

    if (!faviconURL) {
        return <>{fallback}</>;
    }

    return <img src={faviconURL} alt={`Favicon of ${domain}`} {...props} />;
}

/**
 * Get the domain from a URL.
 */
function getDomain(input: string) {
    try {
        const url = new URL(input);
        return url.hostname;
    } catch {
        return null;
    }
}

/**
 * Use Google to get the favicon of a URL.
 */
function getFaviconURL(domain: string) {
    const result = new URL('https://www.google.com/s2/favicons');
    result.searchParams.set('domain', domain);
    result.searchParams.set('sz', '64');
    return result.toString();
}
